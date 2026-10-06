import { isRunningInExpoGo } from 'expo';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

import type { TodayWidgetProps } from './today-widget';
import type { WidgetData } from './widget-data';

/**
 * Loaded lazily: Expo Go has no widget module and would crash on import, so in
 * Expo Go the widget simply does nothing. Development and release builds have it.
 */
function widgets() {
  if (isRunningInExpoGo()) return null;
  /* eslint-disable @typescript-eslint/no-require-imports -- must stay lazy, see above */
  return {
    TodayWidget: (require('./today-widget') as typeof import('./today-widget')).default,
    widgetsDirectory: (require('expo-widgets') as typeof import('expo-widgets')).widgetsDirectory,
  };
  /* eslint-enable @typescript-eslint/no-require-imports */
}

const DRAGON = require('@/assets/images/dragon/anim/idle.png');
const DRAGON_FILE = 'dragon-idle-v1.png';

/** The widget can't read the app's files, so the dragon is copied to the shared folder once. */
async function dragonUri(widgetsDirectory: string | null): Promise<string> {
  if (!widgetsDirectory) return '';
  const file = new File(widgetsDirectory, DRAGON_FILE);
  if (!file.exists) {
    const asset = await Asset.fromModule(DRAGON).downloadAsync();
    if (!asset.localUri) return '';
    new File(asset.localUri).copy(file);
  }
  return file.uri;
}

function nextMidnight(): Date {
  const d = new Date();
  d.setHours(24, 0, 5, 0);
  return d;
}

/**
 * Shows today on the widget now, and tomorrow's fresh list from midnight, so the
 * widget is right in the morning even before the app is opened.
 */
export async function syncTodayWidget(data: WidgetData): Promise<void> {
  const w = widgets();
  if (!w) return;
  try {
    const uri = await dragonUri(w.widgetsDirectory);
    const today: TodayWidgetProps = {
      petName: data.petName,
      energy: data.energy,
      fullBar: data.fullBar,
      energyPerHabit: data.energyPerHabit,
      habits: data.habits,
      awayNote: data.awayNote,
      dragonUri: uri,
      widgetTicks: [],
    };
    const tomorrow: TodayWidgetProps = {
      ...today,
      energy: 0,
      fullBar: data.tomorrowFullBar,
      habits: data.tomorrowHabits,
      awayNote: '',
    };
    w.TodayWidget.updateTimeline([
      { date: new Date(), props: today },
      { date: nextMidnight(), props: tomorrow },
    ]);
  } catch (error) {
    // A widget problem must never break the app.
    console.warn('Could not update the widget', error);
  }
}

/**
 * Habit ids ticked in the widget since the app last synced it. Only the entry on
 * show now counts, so yesterday's ticks never land on today.
 */
export async function readWidgetTicks(): Promise<string[]> {
  const w = widgets();
  if (!w) return [];
  try {
    const now = Date.now();
    const shown = (await w.TodayWidget.getTimeline())
      .filter((entry) => new Date(entry.date).getTime() <= now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return shown?.props.widgetTicks ?? [];
  } catch {
    return [];
  }
}
