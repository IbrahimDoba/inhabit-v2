import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useOnboarding } from '@/hooks/use-onboarding';
import { planHabitReminders } from '@/lib/habit-reminders';
import { hasReminderPermission, remindersSupported, syncHabitReminders } from '@/lib/reminders';

/**
 * Keeps each habit's reminders scheduled for the coming week: after any change to
 * the habits, when a habit is ticked (today's reminder is dropped) and whenever the
 * app comes back to the front (so the week ahead stays topped up).
 */
export function useHabitReminderSync() {
  const { dragonName } = useOnboarding();
  const { companion } = useCompanion();
  const { habits } = useHabits();
  // Bumped when the app returns to the front, so the plan is rebuilt from the real time.
  const [resumed, setResumed] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setResumed((n) => n + 1);
    });
    return () => sub.remove();
  }, []);

  const doneToday = companion?.habitsDoneToday.join(',') ?? '';
  useEffect(() => {
    if (!remindersSupported || !habits) return;
    let cancelled = false;
    (async () => {
      if (!(await hasReminderPermission()) || cancelled) return;
      // Notifications fire on the phone's real clock, so plan from real time.
      const plan = planHabitReminders(habits, new Set(doneToday.split(',')), dragonName, new Date());
      await syncHabitReminders(plan);
    })().catch(() => {
      // Scheduling is best effort; the next change or app open tries again.
    });
    return () => {
      cancelled = true;
    };
  }, [habits, doneToday, dragonName, resumed]);
}
