'use no memo';

import type { WidgetInfo } from 'react-native-android-widget';

import { TodayWidget } from './today-widget';
import { currentWidgetData } from './widget-store';

export const WIDGET_NAME = 'TodayWidget';

/** The widget in both light and dark; Android picks the one matching the phone. */
export function renderToday(info: Pick<WidgetInfo, 'width' | 'height'>) {
  const data = currentWidgetData();
  return {
    light: <TodayWidget data={data} width={info.width} height={info.height} dark={false} />,
    dark: <TodayWidget data={data} width={info.width} height={info.height} dark />,
  };
}
