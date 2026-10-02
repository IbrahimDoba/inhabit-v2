/**
 * On-device saves. On iOS and Android `localStorage` is provided by expo-sqlite
 * (a SQLite-backed key-value store); on web it is the browser's own. Reads and
 * writes are synchronous, so the first render already knows what was saved.
 *
 * Each key stores `{ version, data }`. Bump the version and add a migration
 * when a saved shape changes; unreadable or unknown saves are ignored, never thrown.
 */

import './install-storage';

type Envelope<T> = { version: number; data: T };

function store(): Storage | null {
  // Absent while the web build is rendered on the server.
  return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
}

export function loadSaved<T>(key: string, version: number): T | null {
  try {
    const raw = store()?.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Envelope<T>;
    return saved.version === version ? saved.data : null;
  } catch {
    return null;
  }
}

export function save<T>(key: string, version: number, data: T) {
  try {
    store()?.setItem(key, JSON.stringify({ version, data } satisfies Envelope<T>));
  } catch {
    // A failed write must never crash the app; the next change tries again.
  }
}

export function removeSaved(key: string) {
  try {
    store()?.removeItem(key);
  } catch {
    // Nothing to do.
  }
}
