/**
 * What goes to the cloud and when. Pure functions: the hook does the network
 * and the storage; this decides.
 *
 * The cloud holds one document per account: a copy of the saved slots on the
 * phone. The server gives each save a version number and refuses a save made
 * from an older one, so two phones can never silently overwrite each other.
 */

/** The saved slots that make up a garden, in a fixed order. */
export const CLOUD_SLOTS = [
  'inhabit.onboarding',
  'inhabit.companion',
  'inhabit.habits',
  'inhabit.habitLog',
  'inhabit.room',
] as const;

export type CloudDocument = {
  schema: 1;
  /** Each slot as stored on the phone: `{ version, data }`. Missing slots are absent. */
  slots: Record<string, unknown>;
};

/** What this phone remembers about its last sync, per signed-in account. */
export type CloudMeta = {
  /** The cloud version this phone last saved or loaded. 0 before the first sync. */
  version: number;
  /** Fingerprint of the phone's data at that moment. */
  fingerprint: string | null;
  syncedAt: number | null;
};

export const NO_META: CloudMeta = { version: 0, fingerprint: null, syncedAt: null };

/** Builds the document from the phone's storage. Unreadable slots are left out. */
export function snapshot(read: (key: string) => string | null): CloudDocument {
  const slots: Record<string, unknown> = {};
  for (const key of CLOUD_SLOTS) {
    const raw = read(key);
    if (!raw) continue;
    try {
      slots[key] = JSON.parse(raw);
    } catch {
      // A broken slot is not worth sending.
    }
  }
  return { schema: 1, slots };
}

/** Is this something `snapshot` could have made? Guards against a damaged or foreign save. */
export function isCloudDocument(value: unknown): value is CloudDocument {
  if (typeof value !== 'object' || value === null) return false;
  const doc = value as { schema?: unknown; slots?: unknown };
  return doc.schema === 1 && typeof doc.slots === 'object' && doc.slots !== null && !Array.isArray(doc.slots);
}

/** A short text that changes whenever the document's content does. */
export function fingerprint(doc: CloudDocument): string {
  const text = JSON.stringify(CLOUD_SLOTS.map((key) => doc.slots[key] ?? null));
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return `${text.length}:${hash >>> 0}`;
}

function slotData(doc: CloudDocument, key: string): Record<string, unknown> | null {
  const slot = doc.slots[key] as { data?: unknown } | undefined;
  return typeof slot?.data === 'object' && slot.data !== null ? (slot.data as Record<string, unknown>) : null;
}

/** True once onboarding is finished: there is a dragon worth keeping. */
export function hasDragon(doc: CloudDocument): boolean {
  return slotData(doc, 'inhabit.onboarding')?.isComplete === true;
}

export type SaveSummary = { dragonName: string; stage: string; hatchedOn: string | null; habits: number };

/** A few words about a save, for asking which copy to keep. */
export function summarise(doc: CloudDocument): SaveSummary {
  const onboarding = slotData(doc, 'inhabit.onboarding');
  const companion = slotData(doc, 'inhabit.companion');
  const habits = (doc.slots['inhabit.habits'] as { data?: unknown } | undefined)?.data;
  return {
    dragonName: typeof onboarding?.dragonName === 'string' ? onboarding.dragonName : 'Your dragon',
    stage: typeof companion?.stage === 'string' ? companion.stage : 'baby',
    hatchedOn: typeof companion?.hatchedOn === 'string' ? companion.hatchedOn : null,
    habits: Array.isArray(habits) ? habits.length : 0,
  };
}

export type SyncStep =
  /** Nothing to do. */
  | 'none'
  /** Send the phone's copy. */
  | 'push'
  /** Take the cloud's copy. */
  | 'pull'
  /** Both hold the same thing; just remember the cloud's version. */
  | 'adopt'
  /** Both changed. Only the person can say which garden to keep. */
  | 'ask';

/**
 * Compares the phone with the cloud and says what to do. Never picks a side
 * when both have changed: nothing earned is thrown away without being asked.
 */
export function decide(input: {
  local: CloudDocument;
  meta: CloudMeta;
  cloud: { data: CloudDocument | null; version: number };
}): SyncStep {
  const { local, meta, cloud } = input;
  const localPrint = fingerprint(local);

  if (!cloud.data) return hasDragon(local) ? 'push' : 'none';

  // The cloud is where this phone left it: only the phone can have changed.
  if (cloud.version === meta.version) {
    if (localPrint === meta.fingerprint) return 'none';
    return hasDragon(local) ? 'push' : 'none';
  }

  // The cloud has moved on (or this phone has never synced with this account).
  if (fingerprint(cloud.data) === localPrint) return 'adopt';
  if (!hasDragon(local)) return 'pull';
  if (meta.version > 0 && localPrint === meta.fingerprint) return 'pull';
  return 'ask';
}
