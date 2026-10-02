/**
 * The app's clock. Everything that asks "what time is it for the game" (energy
 * days, journeys, streaks, the sky, which habits are due) reads `now()` instead
 * of `Date.now()`, so the developer time-travel buttons can move it forward.
 *
 * In release builds the offset is always 0. In development it is saved, so a
 * reload stays at the travelled-to time until "Back to real time".
 */

import { useSyncExternalStore } from 'react';

import { loadSaved, removeSaved, save } from '@/lib/storage';

const SAVE_KEY = 'inhabit.dev.clockOffset';
const SAVE_VERSION = 1;

let offset = __DEV__ ? (loadSaved<number>(SAVE_KEY, SAVE_VERSION) ?? 0) : 0;
const listeners = new Set<() => void>();

export function now(): number {
  return Date.now() + offset;
}

export function clockOffset(): number {
  return offset;
}

/** Dev only: move the app clock by `ms` more. */
export function travel(ms: number) {
  if (!__DEV__) return;
  setOffset(offset + ms);
}

/** Dev only: back to the device's real time. */
export function resetClock() {
  setOffset(0);
}

function setOffset(next: number) {
  offset = next;
  if (next === 0) removeSaved(SAVE_KEY);
  else save(SAVE_KEY, SAVE_VERSION, next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Re-renders when the clock is moved. Returns the current offset in ms. */
export function useClockOffset(): number {
  return useSyncExternalStore(subscribe, clockOffset, clockOffset);
}
