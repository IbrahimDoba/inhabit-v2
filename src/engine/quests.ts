/**
 * Quests: small goals that pay diamonds. Daily quests reset each day; special
 * quests are one-time milestones. Progress is worked out from the companion
 * state plus a little garden context, so nothing new needs tracking except
 * what has been claimed. Pure functions, like the rest of the engine.
 */

import { refresh, type CompanionEvent, type CompanionState, type Result } from './companion';
import { GARDEN_PROPS } from './rules';

/** Facts about the garden the companion state does not hold. */
export type QuestContext = {
  habitCount: number;
  /** Plants that have ever reached full bloom. */
  bloomCount: number;
};

export type QuestKind = 'daily' | 'special';

export type QuestDef = {
  id: string;
  kind: QuestKind;
  emoji: string;
  title: string;
  /** Uses `{pet}` for the dragon's name. */
  hint: string;
  reward: number;
  goal: number;
  progress: (state: CompanionState, ctx: QuestContext) => number;
};

export const QUESTS: readonly QuestDef[] = [
  {
    id: 'daily.greet',
    kind: 'daily',
    emoji: '👋',
    title: 'Say hi to {pet}',
    hint: 'Tap {pet} in the garden.',
    reward: 5,
    goal: 1,
    progress: (s) => (s.greetedOn === s.today ? 1 : 0),
  },
  {
    id: 'daily.habits',
    kind: 'daily',
    emoji: '✅',
    title: 'Do 3 habits',
    hint: 'Any three habits count.',
    reward: 10,
    goal: 3,
    progress: (s) => s.habitsDoneToday.length,
  },
  {
    id: 'daily.energy',
    kind: 'daily',
    emoji: '⚡',
    title: "Fill {pet}'s energy",
    hint: 'Do enough habits to fill the bar.',
    reward: 15,
    goal: 1,
    progress: (s) => (s.fullCareToday ? 1 : 0),
  },
  {
    id: 'daily.explore',
    kind: 'daily',
    emoji: '🎒',
    title: 'Send {pet} exploring',
    hint: 'A full bar lets {pet} set off.',
    reward: 10,
    goal: 1,
    progress: (s) => (s.journeyStartedOn === s.today ? 1 : 0),
  },
  {
    id: 'special.journey',
    kind: 'special',
    emoji: '🗺️',
    title: "{pet}'s first adventure",
    hint: 'Collect what {pet} brings home.',
    reward: 20,
    goal: 1,
    progress: (s) => s.journeysCompleted,
  },
  {
    id: 'special.seed',
    kind: 'special',
    emoji: '🌱',
    title: 'Buy your first seed',
    hint: 'Find new plants in the Shop.',
    reward: 25,
    goal: 1,
    progress: (s) => (s.ownedSeeds ?? []).length,
  },
  {
    id: 'special.habits',
    kind: 'special',
    emoji: '🪴',
    title: 'Grow 5 habits',
    hint: 'Each habit is a plant in your garden.',
    reward: 30,
    goal: 5,
    progress: (_s, ctx) => ctx.habitCount,
  },
  {
    id: 'special.bloom',
    kind: 'special',
    emoji: '🌸',
    title: 'Your first bloom',
    hint: 'A plant blooms after 14 days of its habit.',
    reward: 50,
    goal: 1,
    progress: (_s, ctx) => ctx.bloomCount,
  },
  {
    id: 'special.streak',
    kind: 'special',
    emoji: '🔥',
    title: 'A 7-day streak',
    hint: 'Visit {pet} seven days in a row.',
    reward: 75,
    goal: 7,
    progress: (s) => s.bestStreak,
  },
  {
    id: 'special.gifts',
    kind: 'special',
    emoji: '🎁',
    title: 'Collect all 7 gifts',
    hint: 'Each adventure brings one home.',
    reward: 100,
    goal: GARDEN_PROPS.length,
    progress: (s) => s.garden.length,
  },
  {
    id: 'special.growUp',
    kind: 'special',
    emoji: '🐉',
    title: '{pet} grows up',
    hint: 'Seven full days grow a baby dragon.',
    reward: 100,
    goal: 1,
    progress: (s) => (s.stage === 'baby' ? 0 : 1),
  },
];

export type QuestStatus = {
  quest: QuestDef;
  progress: number;
  done: boolean;
  claimed: boolean;
};

function claimedIds(state: CompanionState, kind: QuestKind): string[] {
  if (kind === 'special') return state.claimedSpecial ?? [];
  return state.claimedDaily?.day === state.today ? state.claimedDaily.ids : [];
}

/** Every quest with its progress today. Call with a refreshed state. */
export function questStatuses(state: CompanionState, ctx: QuestContext): QuestStatus[] {
  return QUESTS.map((quest) => {
    const progress = Math.min(quest.progress(state, ctx), quest.goal);
    return {
      quest,
      progress,
      done: progress >= quest.goal,
      claimed: claimedIds(state, quest.kind).includes(quest.id),
    };
  });
}

/** Quests finished but not yet claimed: the tab's badge count. */
export function claimableCount(state: CompanionState, ctx: QuestContext): number {
  return questStatuses(state, ctx).filter((s) => s.done && !s.claimed).length;
}

/** Collects a finished quest's diamonds, once. */
export function claimQuest(state: CompanionState, id: string, ctx: QuestContext, now: number): Result {
  const { state: current, events } = refresh(state, now);
  const status = questStatuses(current, ctx).find((s) => s.quest.id === id);
  if (!status || !status.done || status.claimed) return { state: current, events };

  const reward = status.quest.reward;
  const claimed: Partial<CompanionState> =
    status.quest.kind === 'special'
      ? { claimedSpecial: [...(current.claimedSpecial ?? []), id] }
      : { claimedDaily: { day: current.today, ids: [...claimedIds(current, 'daily'), id] } };
  const event: CompanionEvent = { type: 'diamonds', gained: reward, reason: 'quest' };

  return {
    state: { ...current, ...claimed, diamonds: current.diamonds + reward },
    events: [...events, event],
  };
}

/** Records saying hi to the dragon today (for the daily quest). */
export function greet(state: CompanionState, now: number): Result {
  const { state: current, events } = refresh(state, now);
  if (current.greetedOn === current.today) return { state: current, events };
  return { state: { ...current, greetedOn: current.today }, events };
}
