import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '@/constants/starter-habits';

const CHANNEL_ID = 'daily-reminder';

/** Local notifications only; there is no web support. */
export const remindersSupported = Platform.OS !== 'web';

// Show the reminder as a banner even if the app happens to be open.
if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function reminderBody(petName: string) {
  return `${petName} is waiting in the garden. Ready for one small habit?`;
}

/** Asks for permission if needed. Resolves to whether reminders can be shown. */
export async function requestReminderPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

/** Replaces any existing reminder with one daily reminder at the chosen time. */
export async function scheduleDailyReminder(reminder: Reminder, petName: string) {
  if (!remindersSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!reminder.time) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const [hour, minute] = reminder.time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    content: { title: petName, body: reminderBody(petName) },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}
