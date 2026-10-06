import { completeHabit, createCompanion, refresh, type CompanionState } from '../companion';
import { claimQuest, claimableCount, greet, questStatuses } from '../quests';
import { FULL_BAR_DIAMONDS } from '../rules';

const at = (day: number, hour = 10) => Date.UTC(2026, 9, day, hour);
const ctx = { habitCount: 3, bloomCount: 0 };

function threeHabits(state: CompanionState, day: number) {
  let s = state;
  for (const id of ['a', 'b', 'c']) s = completeHabit(s, id, at(day)).state;
  return s;
}

describe('quests', () => {
  it('tracks daily progress from the day so far', () => {
    let s = createCompanion(at(1));
    s = completeHabit(s, 'a', at(1)).state;
    const habits = questStatuses(s, ctx).find((q) => q.quest.id === 'daily.habits')!;
    expect(habits.progress).toBe(1);
    expect(habits.done).toBe(false);

    s = threeHabits(s, 1);
    expect(questStatuses(s, ctx).find((q) => q.quest.id === 'daily.energy')!.done).toBe(true);
  });

  it('pays a finished quest once and never an unfinished one', () => {
    let s = threeHabits(createCompanion(at(1)), 1);
    expect(claimQuest(s, 'daily.explore', ctx, at(1)).state.diamonds).toBe(FULL_BAR_DIAMONDS);

    const first = claimQuest(s, 'daily.habits', ctx, at(1));
    s = first.state;
    expect(s.diamonds).toBe(FULL_BAR_DIAMONDS + 10);
    expect(first.events).toContainEqual({ type: 'diamonds', gained: 10, reason: 'quest' });
    expect(claimQuest(s, 'daily.habits', ctx, at(1)).state.diamonds).toBe(FULL_BAR_DIAMONDS + 10);
  });

  it('resets daily quests the next day but keeps special ones claimed', () => {
    let s = threeHabits(createCompanion(at(1)), 1);
    s = { ...s, journeysCompleted: 1 };
    s = claimQuest(s, 'daily.habits', ctx, at(1)).state;
    s = claimQuest(s, 'special.journey', ctx, at(1)).state;
    expect(s.diamonds).toBe(FULL_BAR_DIAMONDS + 30);

    s = refresh(s, at(2)).state;
    const statuses = questStatuses(s, ctx);
    expect(statuses.find((q) => q.quest.id === 'daily.habits')!.claimed).toBe(false);
    expect(statuses.find((q) => q.quest.id === 'special.journey')!.claimed).toBe(true);

    s = threeHabits(s, 2);
    expect(claimQuest(s, 'daily.habits', ctx, at(2)).state.diamonds).toBe(
      2 * FULL_BAR_DIAMONDS + 40,
    );
  });

  it('counts saying hi, and how many rewards are waiting', () => {
    let s = createCompanion(at(1));
    expect(claimableCount(s, ctx)).toBe(0);
    s = greet(s, at(1)).state;
    expect(claimableCount(s, ctx)).toBe(1);
    expect(claimableCount(refresh(s, at(2)).state, ctx)).toBe(0);
  });

  it('uses garden context for special quests', () => {
    const s = createCompanion(at(1));
    expect(
      questStatuses(s, { habitCount: 5, bloomCount: 1 })
        .filter((q) => q.done)
        .map((q) => q.quest.id),
    ).toEqual(['special.habits', 'special.bloom']);
  });
});
