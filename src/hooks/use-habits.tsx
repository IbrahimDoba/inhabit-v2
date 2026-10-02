import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { StarterHabits } from '@/constants/starter-habits';
import { EVERY_DAY, newHabitId, type Habit } from '@/lib/habits';
import { loadSaved, removeSaved, save } from '@/lib/storage';

const SAVE_KEY = 'inhabit.habits';
const SAVE_VERSION = 1;
const LOG_KEY = 'inhabit.habitLog';
const LOG_VERSION = 1;

/** Day keys each habit was completed on, for plant growth. */
export type HabitLog = Record<string, string[]>;

export type HabitDraft = Omit<Habit, 'id' | 'createdAt'>;

type HabitsContextValue = {
  /** `null` until the starter habits have been copied in. */
  habits: Habit[] | null;
  /** Turns the starter habits picked in onboarding into real habits, once. */
  seed: (starterIds: readonly string[]) => void;
  add: (draft: HabitDraft) => Habit;
  update: (id: string, draft: HabitDraft) => void;
  remove: (id: string) => void;
  log: HabitLog;
  /** Records a completion on `day` (a day key). Recording the same day twice counts once. */
  logDone: (id: string, day: string) => void;
  /** Takes back a completion on `day`, for undo. */
  unlogDone: (id: string, day: string) => void;
  /** Dev only: forget every habit. */
  reset: () => void;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[] | null>(() =>
    loadSaved<Habit[]>(SAVE_KEY, SAVE_VERSION),
  );

  const [log, setLog] = useState<HabitLog>(() => loadSaved<HabitLog>(LOG_KEY, LOG_VERSION) ?? {});

  useEffect(() => {
    if (habits) save(SAVE_KEY, SAVE_VERSION, habits);
  }, [habits]);

  useEffect(() => save(LOG_KEY, LOG_VERSION, log), [log]);

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      seed: (starterIds) =>
        setHabits((current) => {
          if (current) return current;
          const now = Date.now();
          // Starter ids stay as habit ids, so today's ticks from before still match.
          return StarterHabits.filter((s) => starterIds.includes(s.id)).map((s) => ({
            id: s.id,
            title: s.label,
            emoji: s.emoji,
            timeOfDay: s.timeOfDay,
            days: [...EVERY_DAY],
            createdAt: now,
          }));
        }),
      add: (draft) => {
        const now = Date.now();
        const habit: Habit = { ...draft, title: draft.title.trim(), id: newHabitId(now), createdAt: now };
        setHabits((current) => [...(current ?? []), habit]);
        return habit;
      },
      update: (id, draft) =>
        setHabits((current) =>
          (current ?? []).map((h) => (h.id === id ? { ...h, ...draft, title: draft.title.trim() } : h)),
        ),
      remove: (id) => setHabits((current) => (current ?? []).filter((h) => h.id !== id)),
      log,
      logDone: (id, day) =>
        setLog((l) => (l[id]?.includes(day) ? l : { ...l, [id]: [...(l[id] ?? []), day] })),
      unlogDone: (id, day) =>
        setLog((l) => (l[id] ? { ...l, [id]: l[id].filter((d) => d !== day) } : l)),
      reset: () => {
        removeSaved(SAVE_KEY);
        removeSaved(LOG_KEY);
        setHabits(null);
        setLog({});
      },
    }),
    [habits, log],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) throw new Error('useHabits must be used inside HabitsProvider');
  return context;
}
