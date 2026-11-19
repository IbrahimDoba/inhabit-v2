import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { ApiError, authClient, cloudAvailable, fetchSave, putSave } from '@/lib/api';
import {
  CLOUD_SLOTS,
  decide,
  fingerprint,
  isCloudDocument,
  NO_META,
  snapshot,
  summarise,
  type CloudDocument,
  type CloudMeta,
  type SaveSummary,
} from '@/lib/cloud-save';
import { loadSaved, readRaw, removeSaved, save, writeRaw } from '@/lib/storage';

const META_KEY = 'inhabit.cloud';
const META_VERSION = 1;
/** Wait this long after the last change before saving, so a burst of ticks is one save. */
const SAVE_AFTER_MS = 4000;

export type CloudStatus = 'signedOut' | 'idle' | 'syncing' | 'offline' | 'error';

/** The phone and the cloud both changed; the person picks which garden to keep. */
export type CloudConflict = {
  cloud: SaveSummary;
  phone: SaveSummary;
  /** When the cloud copy was saved, ISO text. */
  cloudSavedAt: string | null;
};

type CloudContextValue = {
  /** False on the web build, which has nowhere safe to keep a session. */
  available: boolean;
  /** The signed-in email, or `null`. */
  email: string | null;
  status: CloudStatus;
  lastSyncedAt: number | null;
  conflict: CloudConflict | null;
  /** Emails a sign-in code. Resolves an error message, or `null` when sent. */
  sendCode: (email: string) => Promise<string | null>;
  /** Signs in with the code. Resolves an error message, or `null` when signed in. */
  verifyCode: (email: string, code: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Deletes the account and its cloud save. The garden on this phone stays. */
  deleteAccount: () => Promise<string | null>;
  syncNow: () => void;
  /** Something on the phone changed; save soon. */
  noteChange: () => void;
  resolve: (keep: 'cloud' | 'phone') => void;
};

const CloudContext = createContext<CloudContextValue | null>(null);

function writeDocument(doc: CloudDocument) {
  for (const key of CLOUD_SLOTS) {
    const slot = doc.slots[key];
    if (slot === undefined) removeSaved(key);
    else writeRaw(key, JSON.stringify(slot));
  }
}

function errorText(error: { message?: string } | null | undefined, fallback: string) {
  return error?.message ? error.message : fallback;
}

/**
 * Optional accounts. Signed in, the garden is copied to the cloud after each
 * change and brought back on a new phone. Signed out, nothing leaves the phone.
 *
 * `onRestore` is called after a cloud copy has been written to storage, so the
 * app can reload everything from it.
 */
export function CloudProvider({ children, onRestore }: { children: ReactNode; onRestore: () => void }) {
  const { data: session } = authClient.useSession();
  const email = cloudAvailable ? (session?.user.email ?? null) : null;

  const [status, setStatus] = useState<CloudStatus>('idle');
  const [meta, setMeta] = useState<CloudMeta>(() => loadSaved<CloudMeta>(META_KEY, META_VERSION) ?? NO_META);
  const [conflict, setConflict] = useState<CloudConflict | null>(null);

  const metaRef = useRef(meta);
  const busy = useRef(false);
  const again = useRef(false);
  const rerun = useRef<() => Promise<void>>(async () => {});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The cloud copy a conflict is about, kept until the person chooses. */
  const pending = useRef<{ data: CloudDocument; version: number } | null>(null);
  const signedIn = useRef(false);
  // Declared before the effect that syncs on sign-in, so that one already sees the new value.
  useEffect(() => {
    signedIn.current = !!email;
  }, [email]);

  const remember = useCallback((next: CloudMeta) => {
    metaRef.current = next;
    setMeta(next);
    save(META_KEY, META_VERSION, next);
  }, []);

  const sync = useCallback(async () => {
    if (!signedIn.current) return;
    if (busy.current) {
      again.current = true;
      return;
    }
    busy.current = true;
    setStatus('syncing');
    try {
      const local = snapshot(readRaw);
      const cloud = await fetchSave();
      const cloudDoc = isCloudDocument(cloud.data) ? cloud.data : null;
      const step = decide({ local, meta: metaRef.current, cloud: { data: cloudDoc, version: cloud.version } });

      if (step === 'push') {
        const result = await putSave(local, cloud.version);
        if (result.ok) {
          remember({ version: result.version, fingerprint: fingerprint(local), syncedAt: Date.now() });
        } else if (isCloudDocument(result.newer.data)) {
          // Another phone saved in the moment between reading and writing.
          pending.current = { data: result.newer.data, version: result.newer.version };
          setConflict({
            cloud: summarise(result.newer.data),
            phone: summarise(local),
            cloudSavedAt: result.newer.updatedAt,
          });
        }
      } else if (step === 'pull' && cloudDoc) {
        writeDocument(cloudDoc);
        remember({ version: cloud.version, fingerprint: fingerprint(cloudDoc), syncedAt: Date.now() });
        onRestore();
      } else if (step === 'adopt') {
        remember({ version: cloud.version, fingerprint: fingerprint(local), syncedAt: Date.now() });
      } else if (step === 'ask' && cloudDoc) {
        pending.current = { data: cloudDoc, version: cloud.version };
        setConflict({ cloud: summarise(cloudDoc), phone: summarise(local), cloudSavedAt: cloud.updatedAt });
      }
      setStatus('idle');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // The session ended on the server (signed out elsewhere, or the account was deleted).
        await authClient.signOut().catch(() => {});
        setStatus('idle');
      } else {
        setStatus(error instanceof ApiError ? 'error' : 'offline');
      }
    } finally {
      busy.current = false;
      if (again.current) {
        again.current = false;
        void rerun.current();
      }
    }
  }, [onRestore, remember]);
  // A sync asked for while one was running starts through this, once the first has finished.
  useEffect(() => {
    rerun.current = sync;
  }, [sync]);

  const noteChange = useCallback(() => {
    if (!signedIn.current || pending.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void sync(), SAVE_AFTER_MS);
  }, [sync]);

  // Signing in, and coming back to the app, both check the cloud straight away.
  useEffect(() => {
    if (!email) return;
    const first = setTimeout(() => void sync(), 0);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !pending.current) void sync();
    });
    return () => {
      clearTimeout(first);
      sub.remove();
    };
  }, [email, sync]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value = useMemo<CloudContextValue>(
    () => ({
      available: cloudAvailable,
      email,
      status: email ? status : 'signedOut',
      lastSyncedAt: meta.syncedAt,
      conflict,
      sendCode: async (address) => {
        try {
          const { error } = await authClient.emailOtp.sendVerificationOtp({ email: address, type: 'sign-in' });
          return error ? errorText(error, 'Could not send the code. Please try again.') : null;
        } catch {
          return 'Could not reach the server. Check your connection and try again.';
        }
      },
      verifyCode: async (address, code) => {
        try {
          const { error } = await authClient.signIn.emailOtp({ email: address, otp: code });
          return error ? errorText(error, 'That code did not work. Check it and try again.') : null;
        } catch {
          return 'Could not reach the server. Check your connection and try again.';
        }
      },
      signOut: async () => {
        await authClient.signOut().catch(() => {});
        pending.current = null;
        setConflict(null);
        // The next account starts from scratch; the garden stays on the phone.
        remember(NO_META);
      },
      deleteAccount: async () => {
        try {
          const { error } = await authClient.deleteUser();
          if (error) {
            return 'For safety, sign out, sign in again with a fresh code, then delete the account.';
          }
        } catch {
          return 'Could not reach the server. Check your connection and try again.';
        }
        await authClient.signOut().catch(() => {});
        pending.current = null;
        setConflict(null);
        remember(NO_META);
        return null;
      },
      syncNow: () => void sync(),
      noteChange,
      resolve: (keep) => {
        const held = pending.current;
        if (!held) return;
        pending.current = null;
        setConflict(null);
        if (keep === 'cloud') {
          writeDocument(held.data);
          remember({ version: held.version, fingerprint: fingerprint(held.data), syncedAt: Date.now() });
          onRestore();
          return;
        }
        // Keep the phone: pretend it was last in step with the cloud's copy, so the next sync sends it.
        remember({ version: held.version, fingerprint: fingerprint(held.data), syncedAt: metaRef.current.syncedAt });
        void sync();
      },
    }),
    [email, status, meta.syncedAt, conflict, remember, sync, noteChange, onRestore],
  );

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
}

export function useCloud() {
  const context = useContext(CloudContext);
  if (!context) throw new Error('useCloud must be used inside CloudProvider');
  return context;
}
