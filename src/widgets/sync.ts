// Web and Android: no home screen widget yet. iOS is in sync.ios.ts.
import type { WidgetData } from './widget-data';

export async function syncTodayWidget(_data: WidgetData): Promise<void> {}

/** Habit ids ticked in the widget since the app last looked. */
export async function readWidgetTicks(): Promise<string[]> {
  return [];
}
