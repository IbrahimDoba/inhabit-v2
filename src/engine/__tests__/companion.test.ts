import {
  buySeed,
  canStartJourney,
  checkIn,
  collectHomecoming,
  completeHabit,
  createCompanion,
  fullBar,
  journeyProgress,
  mood,
  refresh,
  startJourney,
  undoHabit,
  type CompanionState,
} from '../companion';
import { FIRST_JOURNEY_BONUS, GARDEN_PROPS, MAX_PROP_LEVEL, STAGE_RULES } from '../rules';
import { HOUR } from '../time';

// Tests run with TZ=UTC (see the `test` script), so these are exact local times.
const at = (day: number, hour = 10, minute = 0) => Date.UTC(2026, 8, day, hour, minute);
const rng = () => 0;

/** Does `count` distinct habits on the given day. */
function doHabits(state: CompanionState, now: number, count: number, prefix = 'h') {
  let next = state;
  const events = [];
  for (let i = 0; i < count; i++) {
    const result = completeHabit(next, `${prefix}${i}`, now);
    next = result.state;
    events.push(...result.events);
  }
  return { state: next, events };
}

/** A full-care day: fills the bar at 10:00 on `day`. */
function fullDay(state: CompanionState, day: number) {
  return doHabits(state, at(day), fullBar(state) / 5);
}

describe('energy', () => {
  it('starts as a baby with an empty bar and no diamonds', () => {
    const s = createCompanion(at(1));
    expect(s.stage).toBe('baby');
    expect(s.energy).toBe(0);
    expect(s.diamonds).toBe(0);
    expect(fullBar(s)).toBe(15);
  });

  it('gives 5 energy per habit and fills the baby bar with three', () => {
    const { state, events } = doHabits(createCompanion(at(1)), at(1), 3);
    expect(state.energy).toBe(15);
    expect(state.fullCareToday).toBe(true);
    expect(state.totalFullCareDays).toBe(1);
    expect(events.filter((e) => e.type === 'barFull')).toHaveLength(1);
  });

  it('counts the same habit once per day', () => {
    let s = completeHabit(createCompanion(at(1)), 'water', at(1)).state;
    s = completeHabit(s, 'water', at(1, 11)).state;
    expect(s.energy).toBe(5);
  });

  it('pays one diamond, not energy, for habits after the bar is full', () => {
    const full = doHabits(createCompanion(at(1)), at(1), 3).state;
    const { state, events } = completeHabit(full, 'extra', at(1, 12));
    expect(state.energy).toBe(15);
    expect(state.diamonds).toBe(1);
    expect(state.totalFullCareDays).toBe(1);
    expect(events).toEqual([{ type: 'diamonds', gained: 1, reason: 'extraHabit' }]);
  });

  it('starts each day with an empty bar but keeps growth progress', () => {
    const day1 = doHabits(createCompanion(at(1)), at(1), 3).state;
    const day2 = refresh(day1, at(2, 8)).state;
    expect(day2.energy).toBe(0);
    expect(day2.fullCareToday).toBe(false);
    expect(day2.habitsDoneToday).toEqual([]);
    expect(day2.stageDays).toBe(1);
  });

  it('lets the same habit count again the next day', () => {
    let s = completeHabit(createCompanion(at(1)), 'water', at(1)).state;
    s = completeHabit(s, 'water', at(2)).state;
    expect(s.energy).toBe(5);
  });
});

describe('undo', () => {
  it('removes the energy of a habit ticked by mistake', () => {
    let s = doHabits(createCompanion(at(1)), at(1), 2).state;
    s = undoHabit(s, 'h1', at(1)).state;
    expect(s.energy).toBe(5);
    expect(s.habitsDoneToday).toEqual(['h0']);
  });

  it('never takes back a full day once earned', () => {
    let s = doHabits(createCompanion(at(1)), at(1), 3).state;
    s = undoHabit(s, 'h2', at(1)).state;
    expect(s.energy).toBe(15);
    expect(s.fullCareToday).toBe(true);
    expect(s.totalFullCareDays).toBe(1);
  });

  it('ignores habits that were not done', () => {
    const s = createCompanion(at(1));
    expect(undoHabit(s, 'nope', at(1)).state).toEqual(s);
  });
});

describe('growth', () => {
  it('grows from baby to young after 7 full-care days, even with gaps', () => {
    let s = createCompanion(at(1));
    const days = [1, 2, 5, 9, 10, 20, 21]; // missed days in between change nothing
    let grew = false;
    for (const day of days) {
      const result = fullDay(s, day);
      s = result.state;
      grew ||= result.events.some((e) => e.type === 'grewUp');
    }
    expect(grew).toBe(true);
    expect(s.stage).toBe('young');
    expect(s.stageDays).toBe(0);
    expect(fullBar(s)).toBe(20);
  });

  it('keeps today looking full after growing into a bigger bar', () => {
    let s = createCompanion(at(1));
    for (let day = 1; day <= 7; day++) s = fullDay(s, day).state;
    expect(s.stage).toBe('young');
    expect(s.energy).toBe(fullBar(s));
    expect(s.fullCareToday).toBe(true);
  });

  it('does not grow on days without a full bar', () => {
    let s = createCompanion(at(1));
    for (let day = 1; day <= 30; day++) s = doHabits(s, at(day), 2).state;
    expect(s.stage).toBe('baby');
    expect(s.stageDays).toBe(0);
  });

  it('follows the stage table all the way to grown, then stays grown', () => {
    let s = createCompanion(Date.UTC(2026, 0, 1));
    const dayAt = (i: number) => Date.UTC(2026, 0, 1) + i * 24 * HOUR + 10 * HOUR;
    const seen: string[] = [];
    let i = 0;
    for (; i < 7 + 15 + 20; i++) {
      s = doHabits(s, dayAt(i), fullBar(s) / 5).state;
      if (seen.at(-1) !== s.stage) seen.push(s.stage);
    }
    expect(seen).toEqual(['baby', 'young', 'teen', 'grown']);
    for (; i < 100; i++) s = doHabits(s, dayAt(i), 6).state;
    expect(s.stage).toBe('grown');
    expect(fullBar(s)).toBe(30);
  });
});

describe('journeys', () => {
  it('cannot start before the bar is full', () => {
    const s = doHabits(createCompanion(at(1)), at(1), 2).state;
    expect(canStartJourney(s)).toBe(false);
    expect(startJourney(s, at(1), rng).state.journey).toBeNull();
  });

  it('lasts 8 hours as a baby and brings back diamonds and a gift', () => {
    let s = doHabits(createCompanion(at(1)), at(1, 9), 3).state;
    const started = startJourney(s, at(1, 9), rng);
    s = started.state;
    expect(started.events).toContainEqual({ type: 'journeyStarted', returnsAt: at(1, 17) });
    expect(journeyProgress(s, at(1, 13))).toBeCloseTo(0.5);

    const early = refresh(s, at(1, 16, 59));
    expect(early.state.homecoming).toBeNull();

    const back = refresh(s, at(1, 17));
    expect(back.events).toContainEqual({ type: 'journeyReturned' });
    s = back.state;
    expect(s.journey).toBeNull();

    const collected = collectHomecoming(s, at(1, 18));
    s = collected.state;
    expect(s.diamonds).toBe(STAGE_RULES.baby.journeyDiamonds + FIRST_JOURNEY_BONUS);
    expect(s.garden).toEqual([{ prop: GARDEN_PROPS[0], level: 1 }]);
    expect(s.journeysCompleted).toBe(1);
    expect(collected.events).toContainEqual({ type: 'diamonds', gained: 100, reason: 'welcomeBonus' });
  });

  it('only leaves once a day', () => {
    let s = doHabits(createCompanion(at(1)), at(1, 6), 3).state;
    s = startJourney(s, at(1, 6), rng).state;
    s = collectHomecoming(refresh(s, at(1, 15)).state, at(1, 15)).state;
    expect(canStartJourney(s)).toBe(false);
  });

  it('gives the welcome bonus only on the first journey', () => {
    let s = createCompanion(at(1));
    for (const day of [1, 2]) {
      s = fullDay(s, day).state;
      s = startJourney(s, at(day), rng).state;
      s = collectHomecoming(refresh(s, at(day, 20)).state, at(day, 20)).state;
    }
    expect(s.diamonds).toBe(2 * STAGE_RULES.baby.journeyDiamonds + FIRST_JOURNEY_BONUS);
  });

  it('waits for a journey that runs past midnight before the next one', () => {
    let s = doHabits(createCompanion(at(1)), at(1, 20), 3).state;
    s = startJourney(s, at(1, 20), rng).state; // back at 04:00 on day 2
    s = doHabits(s, at(2, 1), 3, 'd2-').state; // bar full on day 2 while still away
    expect(s.fullCareToday).toBe(true);
    expect(canStartJourney(s)).toBe(false);

    s = refresh(s, at(2, 5)).state;
    expect(canStartJourney(s)).toBe(false); // gift not collected yet
    s = collectHomecoming(s, at(2, 5)).state;
    expect(canStartJourney(s)).toBe(true);
  });

  it('fills garden spots in order, then upgrades them, and never past the max level', () => {
    let s = createCompanion(at(1));
    const trips = GARDEN_PROPS.length * MAX_PROP_LEVEL + 3;
    for (let i = 0; i < trips; i++) {
      const now = Date.UTC(2026, 0, 1) + i * 24 * HOUR + 10 * HOUR;
      s = doHabits(s, now, 6).state;
      s = startJourney(s, now, rng).state;
      s = collectHomecoming(refresh(s, now + 9 * HOUR).state, now + 9 * HOUR).state;
      if (i === GARDEN_PROPS.length - 1) {
        expect(s.garden.map((spot) => spot.prop)).toEqual(GARDEN_PROPS);
      }
    }
    expect(s.garden).toHaveLength(GARDEN_PROPS.length);
    expect(s.garden.every((spot) => spot.level === MAX_PROP_LEVEL)).toBe(true);
  });
});

describe('mood', () => {
  it('is content at the start of the day, happy with some energy, proud when full', () => {
    let s = createCompanion(at(1));
    expect(mood(s, at(1))).toBe('content');
    s = completeHabit(s, 'a', at(1)).state;
    expect(mood(s, at(1))).toBe('happy');
    s = doHabits(s, at(1), 3).state;
    expect(mood(s, at(1))).toBe('proud');
  });

  it('is sleepy at night whatever happened today', () => {
    const s = createCompanion(at(1));
    expect(mood(s, at(1, 23))).toBe('sleepy');
    expect(mood(s, at(2, 3))).toBe('sleepy');
  });

  it('forgets yesterday: a new day is content, never sad', () => {
    const s = doHabits(createCompanion(at(1)), at(1), 3).state;
    expect(mood(s, at(3, 10))).toBe('content');
  });
});

describe('streak', () => {
  it('grows on consecutive days and ignores repeat opens on the same day', () => {
    let s = checkIn(createCompanion(at(1)), at(1)).state;
    s = checkIn(s, at(1, 18)).state;
    expect(s.streak).toBe(1);
    s = checkIn(s, at(2)).state;
    s = checkIn(s, at(3)).state;
    expect(s.streak).toBe(3);
  });

  it('quietly starts again after a gap and keeps the best streak', () => {
    let s = createCompanion(at(1));
    for (const day of [1, 2, 3, 4]) s = checkIn(s, at(day)).state;
    s = checkIn(s, at(8)).state;
    expect(s.streak).toBe(1);
    expect(s.bestStreak).toBe(4);
  });
});

describe('shop', () => {
  it('spends diamonds on a seed once, and never goes below zero', () => {
    let s = { ...createCompanion(at(1)), diamonds: 120 };
    const bought = buySeed(s, 'rose', 100, at(1));
    s = bought.state;
    expect(s.diamonds).toBe(20);
    expect(s.ownedSeeds).toEqual(['rose']);
    expect(bought.events).toContainEqual({ type: 'seedBought', seed: 'rose', price: 100 });

    expect(buySeed(s, 'rose', 100, at(1)).state.diamonds).toBe(20);

    const tooPoor = buySeed(s, 'cherry', 250, at(1));
    expect(tooPoor.state.diamonds).toBe(20);
    expect(tooPoor.state.ownedSeeds).toEqual(['rose']);
    expect(tooPoor.events).toContainEqual({ type: 'notEnoughDiamonds', needed: 230 });
  });

  it('works on saves from before the shop existed', () => {
    const old = { ...createCompanion(at(1)), diamonds: 80, ownedSeeds: undefined };
    expect(buySeed(old, 'daisy', 60, at(1)).state.ownedSeeds).toEqual(['daisy']);
  });
});
