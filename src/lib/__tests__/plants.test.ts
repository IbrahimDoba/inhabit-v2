import { growthStage, habitStreak, plantFor, recentDays, speciesFor, SPECIES } from '../plants';

const days = (n: number, start = 1) =>
  Array.from({ length: n }, (_, i) => `2026-10-${String(start + i).padStart(2, '0')}`);

describe('plants', () => {
  it('grows through the stages with total completions', () => {
    expect(growthStage(0)).toBe('sprout');
    expect(growthStage(3)).toBe('growing');
    expect(growthStage(7)).toBe('budding');
    expect(growthStage(14)).toBe('bloom');
    expect(growthStage(200)).toBe('bloom');
  });

  it('counts a day once even if logged twice', () => {
    const p = plantFor('h', undefined, ['2026-10-01', '2026-10-01', '2026-10-02'], '2026-10-01', '2026-10-02');
    expect(p.completions).toBe(2);
    expect(p.toNext).toBe(1);
  });

  it('rests after a few quiet days, only once it has buds or flowers', () => {
    const bloom = days(14);
    expect(plantFor('h', undefined, bloom, '2026-10-01', '2026-10-16').resting).toBe(false);
    const rested = plantFor('h', undefined, bloom, '2026-10-01', '2026-10-17');
    expect(rested.resting).toBe(true);
    expect(rested.sprite).toBe('resting');
    expect(rested.growth).toBe('bloom');

    const sprout = plantFor('h', undefined, days(1), '2026-10-01', '2026-10-20');
    expect(sprout.resting).toBe(false);
    expect(sprout.sprite).toBe('sprout');
  });

  it('never loses growth while resting, and wakes when done again', () => {
    const quiet = plantFor('h', undefined, days(8), '2026-10-01', '2026-10-30');
    expect(quiet.growth).toBe('budding');
    const woken = plantFor('h', undefined, [...days(8), '2026-10-30'], '2026-10-01', '2026-10-30');
    expect(woken.resting).toBe(false);
    expect(woken.growth).toBe('budding');
  });

  it('uses the chosen plant when there is one', () => {
    expect(plantFor('h', 'rose', [], '2026-10-01', '2026-10-01').species).toBe('rose');
  });

  it('gives each habit a stable species', () => {
    expect(speciesFor('water')).toBe(speciesFor('water'));
    expect(SPECIES).toContain(speciesFor('h_abc_123'));
  });

  it('counts a streak over the days a habit is due, skipping days off', () => {
    const everyDay = [0, 1, 2, 3, 4, 5, 6];
    // 2026-10-05 is a Monday.
    expect(habitStreak(everyDay, ['2026-10-03', '2026-10-04', '2026-10-05'], '2026-10-05')).toBe(3);
    // Today not done yet still counts yesterday's run.
    expect(habitStreak(everyDay, ['2026-10-03', '2026-10-04'], '2026-10-05')).toBe(2);
    // Weekdays only: Friday then Monday is unbroken across the weekend.
    expect(habitStreak([1, 2, 3, 4, 5], ['2026-10-02', '2026-10-05'], '2026-10-05')).toBe(2);
    expect(habitStreak(everyDay, ['2026-10-01'], '2026-10-05')).toBe(0);
  });

  it('lists the last week of days, oldest first', () => {
    expect(recentDays('2026-10-02', 3)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02']);
  });
});
