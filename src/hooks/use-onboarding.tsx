import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { randomName, type TraitId } from '@/constants/dragon';
import type { EggId } from '@/constants/eggs';
import type { QuizAnswers } from '@/constants/quiz';
import type { ReminderId } from '@/constants/starter-habits';
import { loadSaved, removeSaved, save } from '@/lib/storage';

const SAVE_KEY = 'inhabit.onboarding';
const SAVE_VERSION = 1;

type OnboardingData = {
  eggId: EggId;
  dragonName: string;
  traitId: TraitId | null;
  quizAnswers: QuizAnswers;
  habitIds: string[];
  reminderId: ReminderId | null;
  streakGoal: number | null;
  isComplete: boolean;
};

type OnboardingState = OnboardingData & {
  setEggId: (id: EggId) => void;
  setDragonName: (name: string) => void;
  setTraitId: (id: TraitId) => void;
  setQuizAnswer: (id: string, value: string | string[]) => void;
  /** The user's name from the quiz, or an empty string. */
  userName: string;
  setHabitIds: (ids: string[]) => void;
  setReminderId: (id: ReminderId) => void;
  setStreakGoal: (days: number) => void;
  complete: () => void;
  /** Dev only: forget everything and start onboarding again. */
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingState | null>(null);

function fresh(): OnboardingData {
  return {
    eggId: 'lavender',
    dragonName: randomName(),
    traitId: null,
    quizAnswers: {},
    habitIds: [],
    reminderId: null,
    streakGoal: null,
    isComplete: false,
  };
}

/** Onboarding choices, saved on the phone as they change. */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(
    () => loadSaved<OnboardingData>(SAVE_KEY, SAVE_VERSION) ?? fresh(),
  );

  useEffect(() => save(SAVE_KEY, SAVE_VERSION, data), [data]);

  const value = useMemo<OnboardingState>(() => {
    const set = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));
    return {
      ...data,
      setEggId: (eggId) => set({ eggId }),
      setDragonName: (dragonName) => set({ dragonName }),
      setTraitId: (traitId) => set({ traitId }),
      setQuizAnswer: (id, value) =>
        setData((d) => ({ ...d, quizAnswers: { ...d.quizAnswers, [id]: value } })),
      userName: typeof data.quizAnswers.name === 'string' ? data.quizAnswers.name.trim() : '',
      setHabitIds: (habitIds) => set({ habitIds }),
      setReminderId: (reminderId) => set({ reminderId }),
      setStreakGoal: (streakGoal) => set({ streakGoal }),
      complete: () => set({ isComplete: true }),
      reset: () => {
        removeSaved(SAVE_KEY);
        setData(fresh());
      },
    };
  }, [data]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
