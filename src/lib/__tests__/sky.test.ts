import { mixHex, skyAt } from '../sky';

describe('sky', () => {
  it('is fully night at midnight with the moon up and no sun', () => {
    const s = skyAt(0);
    expect(s.night).toBe(1);
    expect(s.sun).toBeNull();
    expect(s.moon).not.toBeNull();
  });

  it('is bright day at noon with the sun high and centred', () => {
    const s = skyAt(12);
    expect(s.night).toBe(0);
    expect(s.moon).toBeNull();
    expect(s.sun).toBeCloseTo((12 - 6) / 13.5);
  });

  it('is warmest around golden hour', () => {
    expect(skyAt(18.5).warmth).toBeGreaterThan(skyAt(12).warmth);
    expect(skyAt(18.5).warmth).toBeGreaterThan(skyAt(21).warmth);
  });

  it('blends smoothly between keyframes and wraps past midnight', () => {
    expect(skyAt(10).top).toBe(mixHex('#8EC9F5', '#79BFF2', 0.5));
    expect(skyAt(24)).toEqual(skyAt(0));
    expect(skyAt(-1).night).toBe(skyAt(23).night);
  });
});
