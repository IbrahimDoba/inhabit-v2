import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useOnboarding } from '@/hooks/use-onboarding';
import { now as clockNow } from '@/lib/clock';
import { readWidgetTicks, syncTodayWidget } from '@/widgets/sync';
import { buildWidgetData } from '@/widgets/widget-data';

/**
 * Keeps the home screen widget in step with the app: pushes today's state when
 * it changes, and on opening the app applies habits ticked in the widget.
 */
export function useWidgetSync() {
  const { dragonName } = useOnboarding();
  const { companion, completeHabit } = useCompanion();
  const { habits, logDone } = useHabits();
  const applying = useRef(false);

  // Habits ticked in the widget count as done in the app, once.
  useEffect(() => {
    const apply = async () => {
      if (applying.current || !companion || !habits) return;
      applying.current = true;
      const ticks = await readWidgetTicks();
      for (const id of ticks) {
        if (!companion.habitsDoneToday.includes(id) && habits.some((h) => h.id === id)) {
          completeHabit(id);
          logDone(id, companion.today);
        }
      }
      applying.current = false;
    };
    apply();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') apply();
    });
    return () => sub.remove();
    // Re-subscribing on every state change would re-apply; this runs on open and resume.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!companion, !!habits]);

  // Push the current day to the widget whenever it changes.
  useEffect(() => {
    if (!companion || !habits) return;
    syncTodayWidget(buildWidgetData(companion, habits, dragonName, clockNow()));
  }, [companion, habits, dragonName]);
}
