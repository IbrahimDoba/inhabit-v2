/**
 * Habit plants (PLAN.md section 4): each habit is one plant in the garden.
 * It grows with care and never goes back; when a habit is left for a while its
 * plant rests (closes up), and doing the habit again wakes it. Pure functions.
 */

import type { PlantSpecies, PlantStage } from '@/constants/plant-sprites';
import { daysBetween } from '@/engine/time';

export const SPECIES: readonly PlantSpecies[] = ['bellflower', 'sunflower', 'tulip', 'bluebell'];

/** Total completions needed to reach each stage. Growth only ever moves forward. */
export const STAGE_THRESHOLDS: readonly { stage: Exclude<PlantStage, 'resting'>; from: number }[] = [
  { stage: 'sprout', from: 0 },
  { stage: 'growing', from: 3 },
  { stage: 'budding', from: 7 },
  { stage: 'bloom', from: 14 },
];

/** Days without the habit before a budding or blooming plant rests. */
export const REST_AFTER_DAYS = 3;

/** A stable starter species per habit, from its id, for habits without a chosen plant. */
export function speciesFor(habitId: string): PlantSpecies {
  let hash = 0;
  for (const ch of habitId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SPECIES[hash % SPECIES.length];
}

export function growthStage(completions: number): Exclude<PlantStage, 'resting'> {
  let stage: Exclude<PlantStage, 'resting'> = 'sprout';
  for (const t of STAGE_THRESHOLDS) if (completions >= t.from) stage = t.stage;
  return stage;
}

export type PlantState = {
  species: PlantSpecies;
  /** What to draw: the growth stage, or `resting` while it sleeps. */
  sprite: PlantStage;
  growth: Exclude<PlantStage, 'resting'>;
  completions: number;
  resting: boolean;
  /** Completions still needed for the next stage, or null when in bloom. */
  toNext: number | null;
};

/**
 * A habit's plant today. `doneDays` are the day keys it was completed on;
 * `createdOn` is the day key it was planted.
 */
export function plantFor(
  habitId: string,
  chosen: PlantSpecies | undefined,
  doneDays: readonly string[],
  createdOn: string,
  today: string,
): PlantState {
  const completions = new Set(doneDays).size;
  const growth = growthStage(completions);
  const last = [...doneDays].sort().at(-1) ?? createdOn;
  const idle = daysBetween(last, today);
  // Only grown plants have flowers to close; small ones simply wait.
  const resting = idle >= REST_AFTER_DAYS && (growth === 'budding' || growth === 'bloom');
  const next = STAGE_THRESHOLDS.find((t) => t.from > completions);
  return {
    species: chosen ?? speciesFor(habitId),
    sprite: resting ? 'resting' : growth,
    growth,
    completions,
    resting,
    toNext: next ? next.from - completions : null,
  };
}

export const STAGE_LABELS: Record<PlantStage, string> = {
  sprout: 'a little sprout',
  growing: 'growing',
  budding: 'budding',
  bloom: 'in full bloom',
  resting: 'resting',
};

function dateOfKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function keyOf(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/**
 * Days in a row the habit was done on the days it was due, counting back from
 * today (or yesterday, if today is not done yet). Days it was not due are skipped.
 */
export function habitStreak(
  dueDays: readonly number[],
  doneDays: readonly string[],
  today: string,
): number {
  const done = new Set(doneDays);
  const cursor = dateOfKey(today);
  if (!done.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const key = keyOf(cursor);
    if (dueDays.includes(cursor.getDay())) {
      if (!done.has(key)) break;
      streak++;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** The last `count` days ending today, oldest first, as day keys. */
export function recentDays(today: string, count = 7): string[] {
  const cursor = dateOfKey(today);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.unshift(keyOf(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return out;
}
