/**
 * The companion rules engine: energy, growth, journeys, gifts, mood and streaks.
 *
 * Pure functions only. Every action takes the current state and `now` (ms) and
 * returns the next state plus the events the UI should celebrate. Nothing here
 * reads the clock, storage or randomness directly, so it is fully testable and
 * the dev time-travel button (plan step 7) is just a different `now`.
 *
 * Product rules this enforces (PLAN.md section 2):
 * - Zero punishment: missed days change nothing; there is no sad state.
 * - Nothing earned is taken away: stages, garden spots and diamonds never go down.
 * - One main reward per day: the bar fills once a day; later habits pay a little.
 */

import {
  ENERGY_PER_HABIT,
  EXTRA_HABIT_DIAMONDS,
  FULL_BAR_DIAMONDS,
  FIRST_JOURNEY_BONUS,
  GARDEN_PROPS,
  MAX_PROP_LEVEL,
  STAGES,
  STAGE_RULES,
  type PropId,
  type Stage,
} from './rules';
import { dayKey, daysBetween, HOUR, isNight } from './time';
import { JOURNEY_STORIES } from './stories';

export type GardenSpot = { prop: PropId; level: number };

export type Journey = {
  startedAt: number;
  returnsAt: number;
  storyIndex: number;
  gift: PropId;
  diamonds: number;
};

export type CompanionState = {
  /** Day the dragon hatched, `YYYY-MM-DD`. */
  hatchedOn: string;
  stage: Stage;
  /** Full-care days earned in the current stage. Starts again at 0 after growing up. */
  stageDays: number;
  totalFullCareDays: number;
  /** The day (`YYYY-MM-DD`) that `energy`, `habitsDoneToday` and `fullCareToday` belong to. */
  today: string;
  energy: number;
  habitsDoneToday: string[];
  /** The bar has filled today. It fills at most once a day. */
  fullCareToday: boolean;
  /** Day a journey last started, so only one leaves per day. */
  journeyStartedOn: string | null;
  /** Away on a journey. */
  journey: Journey | null;
  /** Back from a journey; its story and rewards are waiting to be shown and collected. */
  homecoming: Journey | null;
  journeysCompleted: number;
  diamonds: number;
  garden: GardenSpot[];
  streak: number;
  bestStreak: number;
  lastCheckIn: string | null;
  /** Plant types bought in the shop, by id. Starter plants are always available. */
  ownedSeeds?: string[];
  /** Day the dragon was last tapped hello, for the daily quest. */
  greetedOn?: string | null;
  /** Daily quests claimed, for one day only. */
  claimedDaily?: { day: string; ids: string[] };
  /** One-time quests already claimed. */
  claimedSpecial?: string[];
};

export type Mood = 'content' | 'happy' | 'proud' | 'sleepy';

export type CompanionEvent =
  | { type: 'energy'; gained: number; energy: number; fullBar: number }
  | { type: 'barFull' }
  | { type: 'grewUp'; from: Stage; to: Stage }
  | {
      type: 'diamonds';
      gained: number;
      reason: 'extraHabit' | 'fullBar' | 'journey' | 'welcomeBonus' | 'quest';
    }
  | { type: 'journeyStarted'; returnsAt: number }
  | { type: 'journeyReturned' }
  | { type: 'giftPlaced'; spot: GardenSpot; upgraded: boolean }
  | { type: 'streak'; streak: number }
  | { type: 'seedBought'; seed: string; price: number }
  | { type: 'notEnoughDiamonds'; needed: number };

export type Result = { state: CompanionState; events: CompanionEvent[] };

/** Returns a number in [0, 1). Pass `Math.random` in the app and a fixed one in tests. */
export type Rng = () => number;

export function createCompanion(now: number): CompanionState {
  return {
    hatchedOn: dayKey(now),
    stage: 'baby',
    stageDays: 0,
    totalFullCareDays: 0,
    today: dayKey(now),
    energy: 0,
    habitsDoneToday: [],
    fullCareToday: false,
    journeyStartedOn: null,
    journey: null,
    homecoming: null,
    journeysCompleted: 0,
    diamonds: 0,
    garden: [],
    streak: 0,
    bestStreak: 0,
    lastCheckIn: null,
    ownedSeeds: [],
  };
}

export function fullBar(state: CompanionState): number {
  return STAGE_RULES[state.stage].fullBar;
}

/**
 * Brings the state up to `now`: starts a fresh day if the date changed, and
 * brings the dragon home if its journey is over. Every action calls this first.
 */
export function refresh(state: CompanionState, now: number): Result {
  const events: CompanionEvent[] = [];
  let next = state;

  const today = dayKey(now);
  if (today !== next.today) {
    next = { ...next, today, energy: 0, habitsDoneToday: [], fullCareToday: false };
  }

  if (next.journey && now >= next.journey.returnsAt) {
    next = { ...next, journey: null, homecoming: next.journey };
    events.push({ type: 'journeyReturned' });
  }

  return { state: next, events };
}

/** Counts a habit as done today. Doing the same habit twice in a day counts once. */
export function completeHabit(state: CompanionState, habitId: string, now: number): Result {
  const { state: current, events } = refresh(state, now);
  if (current.habitsDoneToday.includes(habitId)) return { state: current, events };

  let next: CompanionState = {
    ...current,
    habitsDoneToday: [...current.habitsDoneToday, habitId],
  };

  // After the day's main reward, habits still pay a little.
  if (next.fullCareToday) {
    next = { ...next, diamonds: next.diamonds + EXTRA_HABIT_DIAMONDS };
    events.push({ type: 'diamonds', gained: EXTRA_HABIT_DIAMONDS, reason: 'extraHabit' });
    return { state: next, events };
  }

  const bar = fullBar(next);
  const energy = Math.min(next.energy + ENERGY_PER_HABIT, bar);
  events.push({ type: 'energy', gained: energy - next.energy, energy, fullBar: bar });
  next = { ...next, energy };

  if (energy >= bar) {
    next = {
      ...next,
      fullCareToday: true,
      stageDays: next.stageDays + 1,
      totalFullCareDays: next.totalFullCareDays + 1,
      diamonds: next.diamonds + FULL_BAR_DIAMONDS,
    };
    events.push({ type: 'barFull' });
    events.push({ type: 'diamonds', gained: FULL_BAR_DIAMONDS, reason: 'fullBar' });
    next = growIfReady(next, events);
  }

  return { state: next, events };
}

/**
 * Takes back a habit ticked by mistake. Before the bar is full this removes its
 * energy. Once the bar has filled, the day's reward stays: nothing earned is taken away.
 */
export function undoHabit(state: CompanionState, habitId: string, now: number): Result {
  const { state: current, events } = refresh(state, now);
  if (!current.habitsDoneToday.includes(habitId)) return { state: current, events };

  const habitsDoneToday = current.habitsDoneToday.filter((id) => id !== habitId);
  const energy = current.fullCareToday
    ? current.energy
    : Math.max(current.energy - ENERGY_PER_HABIT, 0);

  return { state: { ...current, habitsDoneToday, energy }, events };
}

function growIfReady(state: CompanionState, events: CompanionEvent[]): CompanionState {
  const needed = STAGE_RULES[state.stage].daysToGrow;
  if (needed === null || state.stageDays < needed) return state;

  const to = STAGES[STAGES.indexOf(state.stage) + 1];
  events.push({ type: 'grewUp', from: state.stage, to });
  // A bigger bar would make today look unfinished; today stays full.
  return { ...state, stage: to, stageDays: 0, energy: STAGE_RULES[to].fullBar };
}

export function canStartJourney(state: CompanionState): boolean {
  return (
    state.fullCareToday &&
    state.journey === null &&
    state.homecoming === null &&
    state.journeyStartedOn !== state.today
  );
}

/** Sends the dragon off once today's bar is full. It returns after the stage's journey length. */
export function startJourney(state: CompanionState, now: number, rng: Rng): Result {
  const { state: current, events } = refresh(state, now);
  if (!canStartJourney(current)) return { state: current, events };

  const rules = STAGE_RULES[current.stage];
  const isFirst = current.journeysCompleted === 0;
  const journey: Journey = {
    startedAt: now,
    returnsAt: now + rules.journeyHours * HOUR,
    storyIndex: Math.floor(rng() * JOURNEY_STORIES.length),
    gift: nextGift(current.garden, rng),
    diamonds: rules.journeyDiamonds + (isFirst ? FIRST_JOURNEY_BONUS : 0),
  };

  events.push({ type: 'journeyStarted', returnsAt: journey.returnsAt });
  return { state: { ...current, journey, journeyStartedOn: current.today }, events };
}

/** How far through its journey the dragon is, from 0 to 1. 0 when at home. */
export function journeyProgress(state: CompanionState, now: number): number {
  const { journey } = state;
  if (!journey) return 0;
  const span = journey.returnsAt - journey.startedAt;
  return Math.min(Math.max((now - journey.startedAt) / span, 0), 1);
}

/** Accepts what the dragon brought home: its diamonds, and its gift placed in the garden. */
export function collectHomecoming(state: CompanionState, now: number): Result {
  const { state: current, events } = refresh(state, now);
  const trip = current.homecoming;
  if (!trip) return { state: current, events };

  const { garden, spot, upgraded } = placeGift(current.garden, trip.gift);
  const welcome = current.journeysCompleted === 0 ? FIRST_JOURNEY_BONUS : 0;
  if (trip.diamonds - welcome > 0) {
    events.push({ type: 'diamonds', gained: trip.diamonds - welcome, reason: 'journey' });
  }
  if (welcome > 0) events.push({ type: 'diamonds', gained: welcome, reason: 'welcomeBonus' });
  events.push({ type: 'giftPlaced', spot, upgraded });

  return {
    state: {
      ...current,
      homecoming: null,
      journeysCompleted: current.journeysCompleted + 1,
      diamonds: current.diamonds + trip.diamonds,
      garden,
    },
    events,
  };
}

/** Fill empty spots in order; once all are filled, upgrade the least grown one. */
export function nextGift(garden: readonly GardenSpot[], rng: Rng): PropId {
  const empty = GARDEN_PROPS.find((prop) => !garden.some((spot) => spot.prop === prop));
  if (empty) return empty;
  const lowest = [...garden].sort((a, b) => a.level - b.level)[0];
  if (lowest.level < MAX_PROP_LEVEL) return lowest.prop;
  // Everything is fully grown; any gift is a keepsake.
  return GARDEN_PROPS[Math.floor(rng() * GARDEN_PROPS.length)];
}

function placeGift(garden: readonly GardenSpot[], prop: PropId) {
  const existing = garden.find((spot) => spot.prop === prop);
  if (!existing) {
    const spot = { prop, level: 1 };
    return { garden: [...garden, spot], spot, upgraded: false };
  }
  const level = Math.min(existing.level + 1, MAX_PROP_LEVEL);
  const spot = { prop, level };
  return {
    garden: garden.map((s) => (s.prop === prop ? spot : s)),
    spot,
    upgraded: level > existing.level,
  };
}

/** Today's mood. There is no sad mood, by design. */
export function mood(state: CompanionState, now: number): Mood {
  const current = refresh(state, now).state;
  if (isNight(now)) return 'sleepy';
  if (current.fullCareToday) return 'proud';
  if (current.energy > 0) return 'happy';
  return 'content';
}

/**
 * Records opening the app today. Consecutive days grow the streak; after a gap
 * it quietly starts again at 1 and the best streak is kept.
 */
export function checkIn(state: CompanionState, now: number): Result {
  const { state: current, events } = refresh(state, now);
  if (current.lastCheckIn === current.today) return { state: current, events };

  const continues =
    current.lastCheckIn !== null && daysBetween(current.lastCheckIn, current.today) === 1;
  const streak = continues ? current.streak + 1 : 1;
  events.push({ type: 'streak', streak });

  return {
    state: {
      ...current,
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      lastCheckIn: current.today,
    },
    events,
  };
}

/**
 * Buys a plant type in the shop. Diamonds never go below zero: without enough,
 * nothing changes and the event says how many more are needed.
 */
export function buySeed(state: CompanionState, seed: string, price: number, now: number): Result {
  const { state: current, events } = refresh(state, now);
  const owned = current.ownedSeeds ?? [];
  if (owned.includes(seed)) return { state: current, events };
  if (current.diamonds < price) {
    events.push({ type: 'notEnoughDiamonds', needed: price - current.diamonds });
    return { state: current, events };
  }
  events.push({ type: 'seedBought', seed, price });
  return {
    state: { ...current, diamonds: current.diamonds - price, ownedSeeds: [...owned, seed] },
    events,
  };
}
