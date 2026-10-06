// App entry. Expo Router starts the app as usual; on Android this also registers
// the home screen widget's background task, which must happen at start-up.
import 'expo-router/entry';

import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Android-only module
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Android-only module
  const { widgetTaskHandler } = require('./src/widgets/android/task-handler');
  registerWidgetTaskHandler(widgetTaskHandler);
}
