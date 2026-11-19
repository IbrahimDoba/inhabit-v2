import { useEffect } from 'react';

import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { now as clockNow } from '@/lib/clock';
import { groupForDay } from '@/lib/habits';

/**
 * Tells the dragon how many habits are due today, so the energy bar never asks
 * for more habits than the day has. Runs when the habit list or the day changes.
 */
export function useHabitsDueSync() {
  const { companion, setHabitsDue } = useCompanion();
  const { habits } = useHabits();
  const today = companion?.today;

  useEffect(() => {
    if (!today || !habits) return;
    const due = groupForDay(habits, new Date(clockNow())).reduce((n, g) => n + g.habits.length, 0);
    setHabitsDue(due);
    // `setHabitsDue` changes identity with every state change; the list and the day are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, today]);
}
