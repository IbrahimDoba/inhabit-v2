import { MAX_STARTER_HABITS, STARTER_HABIT_COUNT } from '@/constants/starter-habits';

import { withDefaultReminders } from '../habit-reminders';
import type { Habit } from '../habits';
import { curatePlan, suggestedHabitIds } from '../starter-plan';

type Slot = Pick<Habit, 'timeOfDay' | 'reminder'>;

const ids = (answers: Parameters<typeof curatePlan>[0]) => curatePlan(answers).map((p) => p.habit.id);

describe('starter plan', () => {
  it('gives three habits when nothing was chosen', () => {
    const plan = curatePlan({});
    expect(plan).toHaveLength(STARTER_HABIT_COUNT);
    expect(plan.every((p) => p.reason.length > 0)).toBe(true);
  });

  it('grows with the areas chosen, up to five', () => {
    expect(curatePlan({ areas: ['sleep'] })).toHaveLength(3);
    expect(curatePlan({ areas: ['sleep', 'focus'] })).toHaveLength(4);
    expect(curatePlan({ areas: ['sleep', 'focus', 'eating', 'doing'] })).toHaveLength(MAX_STARTER_HABITS);
  });

  it('stays at three in a heavy season', () => {
    expect(curatePlan({ areas: ['sleep', 'focus', 'eating'], overwhelmed: 'always' })).toHaveLength(3);
    expect(curatePlan({ areas: ['sleep', 'focus', 'eating'], weighing: ['burnout'] })).toHaveLength(3);
  });

  it('covers every chosen area before doubling up on one', () => {
    const plan = curatePlan({ areas: ['connection', 'eating', 'sleep'] });
    for (const area of ['connection', 'eating', 'sleep'] as const) {
      expect(plan.some((p) => p.habit.areas.includes(area))).toBe(true);
    }
  });

  it('follows a follow-up answer and says why', () => {
    const plan = curatePlan({ areas: ['sleep'], 'followup.sleep': ['phone'] });
    const bedtime = plan.find((p) => p.habit.id === 'bedtime');
    expect(bedtime?.reason).toBe('Because your phone keeps you up');
  });

  it('names the area a habit is for', () => {
    const plan = curatePlan({ areas: ['eating'] });
    expect(plan.find((p) => p.habit.id === 'fruit')?.reason).toBe('To eat well');
  });

  it('never repeats a habit and matches the suggested ids', () => {
    const answers = { areas: ['calm', 'movement', 'focus'] };
    expect(new Set(ids(answers)).size).toBe(ids(answers).length);
    expect(suggestedHabitIds(answers)).toEqual(ids(answers));
  });
});

describe('default reminders', () => {
  it('gives each habit a time for its part of the day', () => {
    const out = withDefaultReminders<Slot>([{ timeOfDay: 'morning' }, { timeOfDay: 'bedtime' }]);
    expect(out.map((h) => h.reminder)).toEqual(['08:00', '21:30']);
  });

  it('spaces habits that share a time', () => {
    const out = withDefaultReminders<Slot>([{ timeOfDay: 'any' }, { timeOfDay: 'any' }, { timeOfDay: 'any' }]);
    expect(out.map((h) => h.reminder)).toEqual(['10:00', '10:15', '10:30']);
  });

  it('leaves existing reminders alone and steers around them', () => {
    const out = withDefaultReminders<Slot>([{ timeOfDay: 'morning', reminder: '08:00' }, { timeOfDay: 'morning' }]);
    expect(out.map((h) => h.reminder)).toEqual(['08:00', '08:15']);
  });
});
