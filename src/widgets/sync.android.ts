import { requestWidgetUpdate } from 'react-native-android-widget';

import { renderToday, WIDGET_NAME } from './android/render';
import { saveWidgetData, takeWidgetTicks } from './android/widget-store';
import type { WidgetData } from './widget-data';

/** Saves today for the widget and redraws any widgets on the home screen. */
export async function syncTodayWidget(data: WidgetData): Promise<void> {
  try {
    saveWidgetData(data);
    await requestWidgetUpdate({ widgetName: WIDGET_NAME, renderWidget: renderToday });
  } catch (error) {
    // A widget problem must never break the app.
    console.warn('Could not update the widget', error);
  }
}

/** Habits ticked on the widget today, which the app now takes over. */
export async function readWidgetTicks(): Promise<string[]> {
  return takeWidgetTicks();
}
