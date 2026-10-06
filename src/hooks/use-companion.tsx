import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import * as engine from '@/engine/companion';
import * as quests from '@/engine/quests';
import type { CompanionEvent, CompanionState, Result } from '@/engine/companion';
import type { Stage } from '@/engine/rules';
import { now as clockNow, useClockOffset } from '@/lib/clock';
import { loadSaved, removeSaved, save } from '@/lib/storage';

const SAVE_KEY = 'inhabit.companion';
const SAVE_VERSION = 1;

type CompanionContextValue = {
  /** `null` until onboarding hatches the dragon. */
  companion: CompanionState | null;
  /** Creates the dragon and records the first day's check-in. */
  begin: () => void;
  completeHabit: (habitId: string) => CompanionEvent[];
  undoHabit: (habitId: string) => CompanionEvent[];
  startJourney: () => CompanionEvent[];
  collectHomecoming: () => CompanionEvent[];
  /** Catches up with the clock: a new day, or a journey that just ended. */
  refresh: () => CompanionEvent[];
  /** Dev only: bring the dragon home now instead of waiting hours. */
  devFinishJourney: () => void;
  /** Records opening the app now (used by the dev week simulation). */
  checkIn: () => CompanionEvent[];
  buySeed: (seed: string, price: number) => CompanionEvent[];
  /** Records tapping the dragon hello today. */
  greet: () => CompanionEvent[];
  claimQuest: (id: string, ctx: quests.QuestContext) => CompanionEvent[];
  /** The full-bar celebration waiting to show, from whichever screen filled the bar. */
  celebration: Celebration | null;
  dismissCelebration: () => void;
  /** Dev only: forget the dragon. */
  reset: () => void;
};

export type Celebration = {
  grewUp: { from: Stage; to: Stage } | null;
  /** Diamonds the full bar paid. */
  diamonds: number;
};

/** Lets the energy bar finish filling before the celebration covers it. */
const CELEBRATE_AFTER_MS = 1100;

const CompanionContext = createContext<CompanionContextValue | null>(null);

/**
 * Holds the dragon's state, runs every change through the rules engine with the
 * real clock, and saves the result on the phone.
 */
export function CompanionProvider({ children }: { children: ReactNode }) {
  const [companion, setCompanion] = useState<CompanionState | null>(() =>
    loadSaved<CompanionState>(SAVE_KEY, SAVE_VERSION),
  );
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  // Actions return their events straight away, so they read the latest state from here.
  const latest = useRef(companion);

  useEffect(() => {
    latest.current = companion;
    if (companion) save(SAVE_KEY, SAVE_VERSION, companion);
  }, [companion]);

  const run = useCallback((action: (state: CompanionState, now: number) => Result) => {
    const current = latest.current;
    if (!current) return [];
    const { state, events } = action(current, clockNow());
    latest.current = state;
    setCompanion(state);
    if (events.some((e) => e.type === 'barFull')) {
      const grew = events.find((e) => e.type === 'grewUp');
      const grewUp = grew?.type === 'grewUp' ? { from: grew.from, to: grew.to } : null;
      const paid = events.find((e) => e.type === 'diamonds' && e.reason === 'fullBar');
      const diamonds = paid?.type === 'diamonds' ? paid.gained : 0;
      setTimeout(() => setCelebration({ grewUp, diamonds }), CELEBRATE_AFTER_MS);
    }
    return events;
  }, []);

  // Opening the app counts as today's check-in, and catches up on a new day or a
  // finished journey.
  // Moving the developer clock counts as opening the app at the new time.
  const offset = useClockOffset();
  useEffect(() => {
    run(engine.checkIn);
  }, [run, offset]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') run(engine.checkIn);
    });
    return () => subscription.remove();
  }, [run]);

  const value = useMemo<CompanionContextValue>(
    () => ({
      companion,
      begin: () => {
        const now = clockNow();
        const state = engine.checkIn(engine.createCompanion(now), now).state;
        latest.current = state;
        setCompanion(state);
      },
      completeHabit: (id) => run((s, now) => engine.completeHabit(s, id, now)),
      undoHabit: (id) => run((s, now) => engine.undoHabit(s, id, now)),
      startJourney: () => run((s, now) => engine.startJourney(s, now, Math.random)),
      collectHomecoming: () => run(engine.collectHomecoming),
      refresh: () => run(engine.refresh),
      checkIn: () => run(engine.checkIn),
      buySeed: (seed, price) => run((s, now) => engine.buySeed(s, seed, price, now)),
      greet: () => run(quests.greet),
      claimQuest: (id, ctx) => run((s, now) => quests.claimQuest(s, id, ctx, now)),
      celebration,
      dismissCelebration: () => setCelebration(null),
      devFinishJourney: () =>
        run((s, now) =>
          engine.refresh(s.journey ? { ...s, journey: { ...s.journey, returnsAt: now } } : s, now),
        ),
      reset: () => {
        removeSaved(SAVE_KEY);
        latest.current = null;
        setCompanion(null);
      },
    }),
    [companion, run, celebration],
  );

  return <CompanionContext.Provider value={value}>{children}</CompanionContext.Provider>;
}

export function useCompanion() {
  const context = useContext(CompanionContext);
  if (!context) throw new Error('useCompanion must be used inside CompanionProvider');
  return context;
}
