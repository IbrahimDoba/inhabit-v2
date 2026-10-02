import type { PlantSpecies } from '@/constants/plant-sprites';

/**
 * The habit model: what a habit is, when it is due, and how it is grouped.
 * Pure functions only; storage lives in `useHabits`.
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'any';

export const TIMES_OF_DAY: readonly { id: TimeOfDay; label: string; emoji: string }[] = [
  { id: 'morning', label: 'Start the day', emoji: '🌅' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { id: 'evening', label: 'Evening', emoji: '🌆' },
  { id: 'bedtime', label: 'Before bed', emoji: '🌙' },
  { id: 'any', label: 'Any time', emoji: '✨' },
];

/** Days of the week, 0 = Sunday, matching `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAYS: readonly { id: Weekday; short: string; letter: string }[] = [
  { id: 1, short: 'Mon', letter: 'M' },
  { id: 2, short: 'Tue', letter: 'T' },
  { id: 3, short: 'Wed', letter: 'W' },
  { id: 4, short: 'Thu', letter: 'T' },
  { id: 5, short: 'Fri', letter: 'F' },
  { id: 6, short: 'Sat', letter: 'S' },
  { id: 0, short: 'Sun', letter: 'S' },
];

export const EVERY_DAY: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];
export const WORKDAYS: readonly Weekday[] = [1, 2, 3, 4, 5];
export const WEEKEND: readonly Weekday[] = [0, 6];

export type Habit = {
  id: string;
  title: string;
  emoji: string;
  timeOfDay: TimeOfDay;
  /** Days it is due. Never empty. */
  days: Weekday[];
  createdAt: number;
  /** The plant it grows as. Missing on older habits, which get a starter plant. */
  plant?: PlantSpecies;
};

export const HABIT_TITLE_MAX = 40;

export function isDueOn(habit: Habit, date: Date): boolean {
  return habit.days.includes(date.getDay() as Weekday);
}

/** Habits due on `date`, grouped in time-of-day order, empty groups left out. */
export function groupForDay(habits: readonly Habit[], date: Date) {
  const due = habits.filter((habit) => isDueOn(habit, date));
  return TIMES_OF_DAY.map((time) => ({
    ...time,
    habits: due.filter((habit) => habit.timeOfDay === time.id),
  })).filter((group) => group.habits.length > 0);
}

/** A short label for a set of days: "Every day", "Weekdays", "Mon, Wed, Fri". */
export function describeDays(days: readonly Weekday[]): string {
  const set = new Set(days);
  const same = (other: readonly Weekday[]) =>
    other.length === set.size && other.every((d) => set.has(d));
  if (same(EVERY_DAY)) return 'Every day';
  if (same(WORKDAYS)) return 'Weekdays';
  if (same(WEEKEND)) return 'Weekends';
  return WEEKDAYS.filter((d) => set.has(d.id))
    .map((d) => d.short)
    .join(', ');
}

/** Checks a draft before saving. Returns a message for the first problem, or null. */
export function validateHabit(draft: Pick<Habit, 'title' | 'days'>): string | null {
  if (!draft.title.trim()) return 'Give your habit a name.';
  if (draft.title.trim().length > HABIT_TITLE_MAX) return `Keep it under ${HABIT_TITLE_MAX} letters.`;
  if (draft.days.length === 0) return 'Pick at least one day.';
  return null;
}

export function newHabitId(now: number, rng: () => number = Math.random): string {
  return `h_${now.toString(36)}_${Math.floor(rng() * 1e6).toString(36)}`;
}
