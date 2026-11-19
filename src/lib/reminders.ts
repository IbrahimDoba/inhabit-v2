import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '@/constants/starter-habits';
import { HABIT_REMINDER_PREFIX, type PlannedReminder } from '@/lib/habit-reminders';

const CHANNEL_ID = 'daily-reminder';
const HABIT_CHANNEL_ID = 'habit-reminders';
/** The one daily nudge from onboarding. Habit reminders have their own ids. */
const DAILY_ID = 'daily-reminder';

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

/** Whether notifications are allowed, without asking. */
export async function hasReminderPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

/** Replaces the daily reminder with one at the chosen time. Habit reminders are left alone. */
export async function scheduleDailyReminder(reminder: Reminder, petName: string) {
  if (!remindersSupported) return;
  // Older versions scheduled the daily reminder without an id: clear anything that is not a habit's.
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => !n.identifier.startsWith(HABIT_REMINDER_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!reminder.time) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const [hour, minute] = reminder.time.split(':').map(Number);
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: { title: petName, body: reminderBody(petName) },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Makes the scheduled habit reminders match the plan: cancels ones no longer
 * wanted (done today, reminder turned off, habit deleted) and adds new ones.
 */
export async function syncHabitReminders(plan: readonly PlannedReminder[]) {
  if (!remindersSupported) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(HABIT_CHANNEL_ID, {
      name: 'Habit reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const wanted = new Map(plan.map((r) => [r.id, r]));
  const scheduled = (await Notifications.getAllScheduledNotificationsAsync())
    .map((n) => n.identifier)
    .filter((id) => id.startsWith(HABIT_REMINDER_PREFIX));
  const have = new Set(scheduled);

  await Promise.all(
    scheduled.filter((id) => !wanted.has(id)).map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
  await Promise.all(
    plan
      .filter((r) => !have.has(r.id))
      .map((r) =>
        Notifications.scheduleNotificationAsync({
          identifier: r.id,
          content: { title: r.title, body: r.body },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: r.date,
            channelId: HABIT_CHANNEL_ID,
          },
        }),
      ),
  );
}
