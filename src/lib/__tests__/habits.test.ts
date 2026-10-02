import {
  describeDays,
  groupForDay,
  isDueOn,
  validateHabit,
  type Habit,
  type TimeOfDay,
  type Weekday,
} from '../habits';

const habit = (id: string, timeOfDay: TimeOfDay, days: Weekday[]): Habit => ({
  id,
  title: id,
  emoji: '✨',
  timeOfDay,
  days,
  createdAt: 0,
});

// 2026-09-28 is a Monday; 2026-10-03 a Saturday.
const monday = new Date(2026, 8, 28, 10);
const saturday = new Date(2026, 9, 3, 10);

describe('habits', () => {
  it('is due only on its days', () => {
    const weekdays = habit('work', 'any', [1, 2, 3, 4, 5]);
    expect(isDueOn(weekdays, monday)).toBe(true);
    expect(isDueOn(weekdays, saturday)).toBe(false);
  });

  it('groups today’s habits in time-of-day order and skips empty groups', () => {
    const habits = [
      habit('read', 'bedtime', [1]),
      habit('water', 'any', [0, 1, 2, 3, 4, 5, 6]),
      habit('bed', 'morning', [1]),
      habit('gym', 'evening', [6]),
    ];
    const groups = groupForDay(habits, monday);
    expect(groups.map((g) => g.id)).toEqual(['morning', 'bedtime', 'any']);
    expect(groups.flatMap((g) => g.habits.map((h) => h.id))).toEqual(['bed', 'read', 'water']);
  });

  it('describes common day sets in words', () => {
    expect(describeDays([0, 1, 2, 3, 4, 5, 6])).toBe('Every day');
    expect(describeDays([5, 1, 2, 3, 4])).toBe('Weekdays');
    expect(describeDays([6, 0])).toBe('Weekends');
    expect(describeDays([5, 1, 3])).toBe('Mon, Wed, Fri');
  });

  it('needs a name and at least one day', () => {
    expect(validateHabit({ title: '  ', days: [1] })).toMatch(/name/);
    expect(validateHabit({ title: 'Walk', days: [] })).toMatch(/day/);
    expect(validateHabit({ title: 'x'.repeat(41), days: [1] })).toMatch(/under/);
    expect(validateHabit({ title: 'Walk', days: [1] })).toBeNull();
  });
});
