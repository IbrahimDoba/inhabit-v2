import { badgeStatuses, BADGES } from '../badges';
import { checkIn, createCompanion } from '../companion';

const at = (day: number) => Date.UTC(2026, 8, day, 10);
const none = { bloomCount: 0, tickCount: 0 };
const earnedIds = (...args: Parameters<typeof badgeStatuses>) =>
  badgeStatuses(...args).filter((b) => b.earned).map((b) => b.badge.id);

describe('badges', () => {
  it('starts with only the hatching badge', () => {
    expect(earnedIds(createCompanion(at(1)), none)).toEqual(['hatched']);
  });

  it('awards habit, bloom, journey and growth badges from what has been done', () => {
    const s = { ...createCompanion(at(1)), journeysCompleted: 1, stage: 'teen' as const };
    expect(earnedIds(s, { bloomCount: 5, tickCount: 1 })).toEqual([
      'hatched', 'first-habit', 'first-journey', 'young', 'first-bloom', 'teen', 'five-blooms',
    ]);
  });

  it('keeps a streak badge after the streak ends', () => {
    let s = createCompanion(at(1));
    for (let day = 1; day <= 7; day++) s = checkIn(s, at(day)).state;
    expect(earnedIds(s, none)).toEqual(expect.arrayContaining(['streak-3', 'streak-7']));
    s = checkIn(s, at(20)).state;
    expect(s.streak).toBe(1);
    expect(earnedIds(s, none)).toEqual(expect.arrayContaining(['streak-3', 'streak-7']));
  });

  it('has a unique id for every badge', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});
