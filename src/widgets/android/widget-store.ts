import { dayKey } from '@/engine/time';
import { loadSaved, removeSaved, save } from '@/lib/storage';

import { withWidgetTicks, type WidgetData } from '../widget-data';

// Shared between the app and the widget's background task, through on-device storage.
const DATA_KEY = 'inhabit.widget.data';
const TICKS_KEY = 'inhabit.widget.ticks';
const VERSION = 1;

type SavedData = { day: string; data: WidgetData };
type SavedTicks = { day: string; ids: string[] };

export function saveWidgetData(data: WidgetData) {
  save<SavedData>(DATA_KEY, VERSION, { day: dayKey(Date.now()), data });
}

function todaysTicks(): string[] {
  const saved = loadSaved<SavedTicks>(TICKS_KEY, VERSION);
  return saved?.day === dayKey(Date.now()) ? saved.ids : [];
}

/** Records a ✓ tapped on the widget, for the app to pick up. */
export function addWidgetTick(id: string) {
  const ids = todaysTicks();
  if (!ids.includes(id)) save<SavedTicks>(TICKS_KEY, VERSION, { day: dayKey(Date.now()), ids: [...ids, id] });
}

/** Ticks made on the widget today; clears them, since the app is taking them over. */
export function takeWidgetTicks(): string[] {
  const ids = todaysTicks();
  removeSaved(TICKS_KEY);
  return ids;
}

/**
 * What the widget should show now: the app's last update plus any ticks since.
 * After midnight, before the app is opened, it shows the new day's habits.
 */
export function currentWidgetData(): WidgetData | null {
  const saved = loadSaved<SavedData>(DATA_KEY, VERSION);
  if (!saved) return null;
  const today = dayKey(Date.now());
  const data =
    saved.day === today
      ? saved.data
      : {
          ...saved.data,
          energy: 0,
          fullBar: saved.data.tomorrowFullBar,
          habits: saved.data.tomorrowHabits,
          awayNote: '',
        };
  return withWidgetTicks(data, todaysTicks());
}
