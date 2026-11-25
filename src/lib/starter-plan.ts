import { buildQuiz, type AreaId, type QuizAnswers } from '@/constants/quiz';
import {
  MAX_STARTER_HABITS,
  STARTER_HABIT_COUNT,
  StarterHabits,
  type ReminderId,
  type StarterHabit,
} from '@/constants/starter-habits';

/** Extra weight for a habit when a follow-up answer points straight at it. */
const FOLLOW_UP_BOOSTS: Record<string, Record<string, string[]>> = {
  'followup.sleep': { phone: ['bedtime'], thoughts: ['breathe', 'journal'], schedule: ['bedtime'] },
  'followup.focus': { phone: ['phone'], mind: ['focus', 'breathe'], tired: ['water', 'outside'] },
  'followup.movement': { time: ['stretch'], energy: ['stretch', 'outside'], start: ['walk'] },
  'followup.doing': { big: ['onetask'], start: ['onetask', 'tidy'], distracted: ['phone', 'focus'] },
  'followup.calm': { everything: ['breathe'], work: ['outside'], people: ['journal'] },
  'followup.eating': { busy: ['water'], skipping: ['fruit'], cooking: ['fruit'] },
  'followup.connection': { time: ['friend'], awkward: ['friend'], far: ['friend'] },
  'followup.kindness': { mistakes: ['kind'], comparing: ['kind', 'phone'], rest: ['kind'] },
};

const HEAVY = ['stress', 'lowmood', 'anxiety', 'burnout'];

function list(answers: QuizAnswers, id: string): string[] {
  const value = answers[id];
  return Array.isArray(value) ? value : value ? [value] : [];
}

/**
 * Orders the starter habits for these quiz answers, best match first. Chosen
 * areas matter most; follow-ups sharpen the pick; a heavy season favours tiny habits.
 */
export function rankStarterHabits(answers: QuizAnswers): StarterHabit[] {
  const areas = list(answers, 'areas') as AreaId[];
  const heavy = isHeavy(answers);

  const score = new Map(StarterHabits.map((habit) => [habit.id, 0]));
  const add = (id: string, points: number) => score.set(id, (score.get(id) ?? 0) + points);

  for (const habit of StarterHabits) {
    for (const area of habit.areas) if (areas.includes(area)) add(habit.id, 3);
    if (heavy && habit.tiny) add(habit.id, 1);
  }
  // Only follow-ups still in the quiz count, in case the areas were changed after.
  for (const question of buildQuiz(answers)) {
    const boosts = FOLLOW_UP_BOOSTS[question.id];
    for (const choice of list(answers, question.id)) {
      for (const id of boosts?.[choice] ?? []) add(id, 2);
    }
  }
  if (answers.mornings === 'hard') add('bed', 1);
  if (answers.activity === 'hardly') add('stretch', 1);
  if (answers.people === 'none' || list(answers, 'weighing').includes('lonely')) add('friend', 1);
  add('water', 0.5);

  // Stable sort keeps the list's own order for ties.
  return [...StarterHabits].sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0));
}

/** Why a habit was picked, in a few words, when a follow-up answer points straight at it. */
const FOLLOW_UP_REASONS: Record<string, Record<string, string>> = {
  'followup.sleep': {
    phone: 'Because your phone keeps you up',
    thoughts: 'To quiet racing thoughts',
    schedule: 'To even out your evenings',
  },
  'followup.focus': {
    phone: 'Because your phone pulls you away',
    mind: 'For a wandering mind',
    tired: 'For when you are tired',
  },
  'followup.movement': {
    time: 'Fits even a busy day',
    energy: 'Gentle, for low-energy days',
    start: 'An easy place to start',
  },
  'followup.doing': {
    big: 'Makes big things smaller',
    start: 'Makes starting easier',
    distracted: 'To cut distractions',
  },
  'followup.calm': {
    everything: 'For when it is all too much',
    work: 'A break from work',
    people: 'To sort your thoughts',
  },
  'followup.eating': {
    busy: 'Easy on busy days',
    skipping: 'So you do not skip meals',
    cooking: 'No cooking needed',
  },
  'followup.kindness': {
    mistakes: 'For after a mistake',
    comparing: 'To stop comparing',
    rest: 'Permission to rest',
  },
};

const AREA_REASONS: Record<AreaId, string> = {
  calm: 'To feel calmer',
  sleep: 'For better sleep',
  movement: 'To move a little more',
  focus: 'For your focus',
  eating: 'To eat well',
  connection: 'To stay in touch',
  kindness: 'To be kinder to yourself',
  doing: 'To get things done',
};

export type PlannedHabit = { habit: StarterHabit; reason: string };

function isHeavy(answers: QuizAnswers) {
  return (
    ['often', 'always'].includes(answers.overwhelmed as string) ||
    list(answers, 'weighing').some((w) => HEAVY.includes(w))
  );
}

/** The most specific true thing to say about why this habit is in the plan. */
function reasonFor(habit: StarterHabit, answers: QuizAnswers, areas: readonly AreaId[]): string {
  for (const question of buildQuiz(answers)) {
    for (const choice of list(answers, question.id)) {
      if (FOLLOW_UP_BOOSTS[question.id]?.[choice]?.includes(habit.id)) {
        const reason = FOLLOW_UP_REASONS[question.id]?.[choice];
        if (reason) return reason;
      }
    }
  }
  const area = areas.find((a) => habit.areas.includes(a));
  if (area) return AREA_REASONS[area];
  if (habit.id === 'bed' && answers.mornings === 'hard') return 'An easy win for hard mornings';
  if (habit.id === 'stretch' && answers.activity === 'hardly') return 'A gentle start to moving';
  if (habit.id === 'friend') return 'A little connection';
  if (habit.tiny && isHeavy(answers)) return 'Tiny, for heavy days';
  return 'A good one to start with';
}

/**
 * The starter plan for these answers: three to five habits, each with why it was
 * picked. Every chosen area gets its best habit before any area gets a second, so
 * the plan covers what was asked for. A heavy season or a single area keeps it at
 * three; more areas grow it, up to five.
 */
export function curatePlan(answers: QuizAnswers): PlannedHabit[] {
  const areas = list(answers, 'areas') as AreaId[];
  const size = isHeavy(answers)
    ? STARTER_HABIT_COUNT
    : Math.min(MAX_STARTER_HABITS, Math.max(STARTER_HABIT_COUNT, areas.length + 2));
  const ranked = rankStarterHabits(answers);
  const picked: StarterHabit[] = [];
  for (const area of areas) {
    if (picked.length >= size) break;
    const best = ranked.find((h) => h.areas.includes(area) && !picked.includes(h));
    if (best) picked.push(best);
  }
  for (const habit of ranked) {
    if (picked.length >= size) break;
    if (!picked.includes(habit)) picked.push(habit);
  }
  // Best match first, as ranked.
  return ranked
    .filter((h) => picked.includes(h))
    .map((habit) => ({ habit, reason: reasonFor(habit, answers, areas) }));
}

export function suggestedHabitIds(answers: QuizAnswers): string[] {
  return curatePlan(answers).map(({ habit }) => habit.id);
}

const REMINDER_BY_ENERGY: Record<string, ReminderId> = {
  morning: 'morning',
  afternoon: 'midday',
  evening: 'evening',
  night: 'bedtime',
};

export function suggestedReminder(answers: QuizAnswers): ReminderId | null {
  return REMINDER_BY_ENERGY[answers.energyTime as string] ?? null;
}
