import { isDueOn, type Habit } from '@/lib/habits';

/** iOS keeps at most 64 pending local notifications per app; leave room for the daily one. */
export const MAX_HABIT_REMINDERS = 60;
/** How far ahead reminders are scheduled. The app tops them up whenever it opens. */
export const REMINDER_DAYS_AHEAD = 7;
/** Scheduled habit reminders carry ids with this prefix, so they can be replaced without touching others. */
export const HABIT_REMINDER_PREFIX = 'habit:';

export type PlannedReminder = {
  id: string;
  habitId: string;
  date: Date;
  title: string;
  body: string;
};

const LINES = [
  (pet: string) => `${pet} saved you a spot in the garden.`,
  (pet: string) => `${pet} is cheering you on. Just this one?`,
  (pet: string) => `Your plant is ready for a little care. ${pet} too!`,
  (pet: string) => `${pet} would love to do this with you.`,
];

/** "08:30" to hours and minutes, or null if it is not a valid time. */
export function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** "08:30" to "8:30 AM". */
export function formatTime(time: string): string {
  const parsed = parseTime(time);
  if (!parsed) return time;
  const { hour, minute } = parsed;
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/** Moves a time by some minutes, wrapping around midnight. */
export function shiftTime(time: string, minutes: number): string {
  const parsed = parseTime(time) ?? { hour: 9, minute: 0 };
  const total = (((parsed.hour * 60 + parsed.minute + minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** A short, stable hash of some text. */
function fingerprint(text: string) {
  let hash = 0;
  for (const c of text) hash = (hash * 31 + c.codePointAt(0)!) | 0;
  return (hash >>> 0).toString(36);
}

function dateKey(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Every reminder to schedule from `now`: one per habit with a reminder, on each
 * due day in the coming week, at its time. Today's is skipped once the habit is
 * done or the time has passed. Soonest first, capped for the iOS limit.
 */
export function planHabitReminders(
  habits: readonly Habit[],
  doneToday: ReadonlySet<string>,
  petName: string,
  now: Date,
  days = REMINDER_DAYS_AHEAD,
): PlannedReminder[] {
  const planned: PlannedReminder[] = [];
  for (const habit of habits) {
    const time = habit.reminder ? parseTime(habit.reminder) : null;
    if (!time) continue;
    for (let offset = 0; offset < days; offset++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, time.hour, time.minute);
      if (date.getTime() <= now.getTime()) continue;
      if (offset === 0 && doneToday.has(habit.id)) continue;
      if (!isDueOn(habit, date)) continue;
      // The time and a fingerprint of the wording are in the id, so editing either reschedules it.
      const hhmm = `${String(time.hour).padStart(2, '0')}${String(time.minute).padStart(2, '0')}`;
      planned.push({
        id: `${HABIT_REMINDER_PREFIX}${habit.id}:${dateKey(date)}:${hhmm}:${fingerprint(habit.emoji + habit.title)}`,
        habitId: habit.id,
        date,
        title: `${habit.emoji} ${habit.title}`,
        body: LINES[(date.getDate() + habit.title.length) % LINES.length](petName),
      });
    }
  }
  return planned.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, MAX_HABIT_REMINDERS);
}

/** A sensible first reminder time for a habit, from when in the day it happens. */
export function defaultReminderTime(timeOfDay: Habit['timeOfDay']): string {
  return { morning: '08:00', afternoon: '13:00', evening: '18:30', bedtime: '21:30', any: '10:00' }[
    timeOfDay
  ];
}

/** Quick picks offered for each time of day. */
export const REMINDER_PRESETS: Record<Habit['timeOfDay'], readonly string[]> = {
  morning: ['07:00', '08:00', '09:00'],
  afternoon: ['12:00', '13:00', '15:00'],
  evening: ['17:30', '18:30', '19:30'],
  bedtime: ['21:00', '21:30', '22:00'],
  any: ['09:00', '12:00', '18:00'],
};
