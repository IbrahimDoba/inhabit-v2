/**
 * Badges: keepsakes for things already done. Each is earned from numbers that
 * only ever go up (best streak, stage, journeys), so a badge is never lost.
 */

import type { CompanionState } from './companion';
import { STAGES, type Stage } from './rules';

export type BadgeContext = {
  /** Plants that have ever reached full bloom. */
  bloomCount: number;
  /** Times any habit has been done. */
  tickCount: number;
};

export type BadgeId =
  | 'first-habit'
  | 'hatched'
  | 'streak-3'
  | 'first-journey'
  | 'streak-7'
  | 'young'
  | 'first-bloom'
  | 'streak-14'
  | 'teen'
  | 'five-blooms'
  | 'streak-30'
  | 'grown';

export type BadgeDef = {
  id: BadgeId;
  name: string;
  /** How it is earned, shown while locked and after. */
  how: string;
  earned: (state: CompanionState, ctx: BadgeContext) => boolean;
};

const reached = (state: CompanionState, stage: Stage) =>
  STAGES.indexOf(state.stage) >= STAGES.indexOf(stage);

/** In roughly the order they are earned. */
export const BADGES: readonly BadgeDef[] = [
  { id: 'hatched', name: 'Hatched', how: 'Hatch your dragon.', earned: () => true },
  { id: 'first-habit', name: 'First step', how: 'Do your first habit.', earned: (s, c) => c.tickCount >= 1 || s.totalFullCareDays >= 1 },
  { id: 'streak-3', name: '3 days', how: 'Visit 3 days in a row.', earned: (s) => s.bestStreak >= 3 },
  { id: 'first-journey', name: 'Explorer', how: 'Welcome your dragon home from a journey.', earned: (s) => s.journeysCompleted >= 1 },
  { id: 'streak-7', name: '7 days', how: 'Visit 7 days in a row.', earned: (s) => s.bestStreak >= 7 },
  { id: 'young', name: 'Growing up', how: 'Your dragon becomes Young.', earned: (s) => reached(s, 'young') },
  { id: 'first-bloom', name: 'First bloom', how: 'Grow a plant to full bloom.', earned: (_s, c) => c.bloomCount >= 1 },
  { id: 'streak-14', name: '14 days', how: 'Visit 14 days in a row.', earned: (s) => s.bestStreak >= 14 },
  { id: 'teen', name: 'Teen dragon', how: 'Your dragon becomes a Teen.', earned: (s) => reached(s, 'teen') },
  { id: 'five-blooms', name: 'In full flower', how: 'Grow 5 plants to full bloom.', earned: (_s, c) => c.bloomCount >= 5 },
  { id: 'streak-30', name: '30 days', how: 'Visit 30 days in a row.', earned: (s) => s.bestStreak >= 30 },
  { id: 'grown', name: 'All grown up', how: 'Your dragon is fully Grown.', earned: (s) => reached(s, 'grown') },
];

export type BadgeStatus = { badge: BadgeDef; earned: boolean };

export function badgeStatuses(state: CompanionState, ctx: BadgeContext): BadgeStatus[] {
  return BADGES.map((badge) => ({ badge, earned: badge.earned(state, ctx) }));
}
