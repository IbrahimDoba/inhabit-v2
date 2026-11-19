import {
  formatTime,
  MAX_HABIT_REMINDERS,
  parseTime,
  planHabitReminders,
  shiftTime,
} from '../habit-reminders';
import { EVERY_DAY, type Habit } from '../habits';

// Thursday 2026-10-22, 09:00 local time (tests run in UTC).
const NOW = new Date(2026, 9, 22, 9, 0);

const habit = (over: Partial<Habit> = {}): Habit => ({
  id: 'water',
  title: 'Drink water',
  emoji: '💧',
  timeOfDay: 'morning',
  days: [...EVERY_DAY],
  createdAt: 0,
  reminder: '10:00',
  ...over,
});

describe('habit reminders', () => {
  it('schedules one a day for the coming week at the chosen time', () => {
    const plan = planHabitReminders([habit()], new Set(), 'Ember', NOW);
    expect(plan).toHaveLength(7);
    expect(plan[0].date).toEqual(new Date(2026, 9, 22, 10, 0));
    expect(plan[6].date).toEqual(new Date(2026, 9, 28, 10, 0));
    expect(plan[0].id).toMatch(/^habit:water:2026-10-22:1000:/);
    // Changing the wording or time gives new ids, so the old reminders get replaced.
    const renamed = planHabitReminders([habit({ title: 'Drink more water' })], new Set(), 'Ember', NOW);
    expect(renamed[0].id).not.toBe(plan[0].id);
    expect(plan[0].title).toBe('💧 Drink water');
    expect(plan[0].body).toContain('Ember');
  });

  it('skips today once the habit is done, or when the time has passed', () => {
    expect(planHabitReminders([habit()], new Set(['water']), 'Ember', NOW)[0].date).toEqual(
      new Date(2026, 9, 23, 10, 0),
    );
    const early = planHabitReminders([habit({ reminder: '08:00' })], new Set(), 'Ember', NOW);
    expect(early[0].date).toEqual(new Date(2026, 9, 23, 8, 0));
    expect(early).toHaveLength(6);
  });

  it('only reminds on the days the habit is due', () => {
    // Weekends only: Saturday 24th and Sunday 25th within the week.
    const plan = planHabitReminders([habit({ days: [0, 6] })], new Set(), 'Ember', NOW);
    expect(plan.map((r) => r.date.getDate())).toEqual([24, 25]);
  });

  it('leaves out habits without a reminder and keeps under the iOS limit', () => {
    expect(planHabitReminders([habit({ reminder: undefined })], new Set(), 'E', NOW)).toEqual([]);
    const many = Array.from({ length: 12 }, (_, i) => habit({ id: `h${i}` }));
    const plan = planHabitReminders(many, new Set(), 'E', NOW);
    expect(plan).toHaveLength(MAX_HABIT_REMINDERS);
    expect(plan.every((r, i) => i === 0 || r.date >= plan[i - 1].date)).toBe(true);
  });

  it('reads, formats and shifts times', () => {
    expect(parseTime('08:30')).toEqual({ hour: 8, minute: 30 });
    expect(parseTime('25:00')).toBeNull();
    expect(formatTime('08:30')).toBe('8:30 AM');
    expect(formatTime('00:05')).toBe('12:05 AM');
    expect(formatTime('13:00')).toBe('1:00 PM');
    expect(shiftTime('23:45', 15)).toBe('00:00');
    expect(shiftTime('00:00', -15)).toBe('23:45');
  });
});
