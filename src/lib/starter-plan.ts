import { buildQuiz, type AreaId, type QuizAnswers } from '@/constants/quiz';
import {
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
  const heavy =
    ['often', 'always'].includes(answers.overwhelmed as string) ||
    list(answers, 'weighing').some((w) => HEAVY.includes(w));

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

export function suggestedHabitIds(answers: QuizAnswers): string[] {
  return rankStarterHabits(answers)
    .slice(0, STARTER_HABIT_COUNT)
    .map((habit) => habit.id);
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
