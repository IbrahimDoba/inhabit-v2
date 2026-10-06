'use no memo';

import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { renderToday } from './render';
import { TICK_ACTION } from './today-widget';
import { addWidgetTick } from './widget-store';

/**
 * Runs in the background when the widget is added, resized, refreshed or tapped,
 * even if the app is closed. A ✓ tap is saved and the widget redrawn at once.
 */
export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  clickAction,
  clickActionData,
  renderWidget,
}: WidgetTaskHandlerProps) {
  if (widgetAction === 'WIDGET_DELETED') return;
  if (widgetAction === 'WIDGET_CLICK' && clickAction === TICK_ACTION) {
    const id = clickActionData?.id;
    if (typeof id === 'string') addWidgetTick(id);
  }
  renderWidget(renderToday(widgetInfo));
}
