import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingPage } from '@/components/onboarding-page';
import { PrimaryButton } from '@/components/primary-button';
import { IconPebble } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Reminders } from '@/constants/starter-habits';
import { Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';
import {
  reminderBody,
  remindersSupported,
  requestReminderPermission,
  scheduleDailyReminder,
} from '@/lib/reminders';
import { suggestedReminder } from '@/lib/starter-plan';

const appIcon = require('@/assets/images/icon.png');

export default function ReminderScreen() {
  const theme = useTheme();
  const { dragonName, quizAnswers, reminderId, setReminderId } = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const suggested = suggestedReminder(quizAnswers) !== null;
  const reminder = Reminders.find((r) => r.id === reminderId);
  const wantsReminder = !!reminder?.time;

  const next = async () => {
    if (!reminder) return;
    if (wantsReminder && remindersSupported) {
      setBusy(true);
      const granted = await requestReminderPermission();
      if (granted) await scheduleDailyReminder(reminder, dragonName);
      setBusy(false);
      // Stay a moment so the note about Settings can be read; the choice is kept either way.
      if (!granted && !denied) {
        setDenied(true);
        return;
      }
    }
    router.push('/onboarding/day-one');
  };

  const label = !reminder
    ? 'Pick a time'
    : !wantsReminder
      ? 'Continue without reminders'
      : denied
        ? 'Continue'
        : remindersSupported
          ? 'Turn on reminders'
          : 'Sounds good';

  return (
    <OnboardingPage
      title={`Get reminders from ${dragonName}`}
      hint={
        suggested
          ? 'One gentle nudge a day, when you have the most energy. Change it if you like.'
          : 'One gentle nudge a day. Never more.'
      }
      footer={<PrimaryButton label={label} onPress={next} disabled={!reminder || busy} />}>
      <View
        style={[styles.preview, { backgroundColor: theme.bubble }]}
        accessibilityLabel={`Example reminder from ${dragonName}: ${reminderBody(dragonName)}`}>
        <Image source={appIcon} style={styles.icon} accessible={false} />
        <View style={styles.previewText}>
          <View style={styles.previewTop}>
            <ThemedText type="smallBold" themeColor="ink">
              {dragonName}
            </ThemedText>
            <ThemedText type="small" themeColor="inkSecondary">
              {reminder?.time ?? 'now'}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="ink">
            {reminderBody(dragonName)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.list} accessibilityRole="radiogroup">
        {Reminders.map((option) => {
          const isSelected = option.id === reminderId;
          return (
            <Pressable
              key={option.id}
              onPress={() => {
                setReminderId(option.id);
                setDenied(false);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.time ? `${option.label}, ${option.time}` : option.label}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: isSelected ? theme.primarySoft : theme.artCard,
                  borderColor: isSelected ? theme.primary : 'transparent',
                },
                pressed && styles.pressed,
              ]}>
              <IconPebble emoji={option.emoji} size={40} />
              <ThemedText type="smallBold" themeColor="ink" style={styles.label}>
                {option.label}
              </ThemedText>
              {option.time ? (
                <ThemedText type="smallBold" themeColor="inkSecondary" style={styles.time}>
                  {option.time}
                </ThemedText>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <ThemedText type="small" themeColor="inkSecondary" style={styles.note}>
        {denied
          ? 'Reminders are off for now. You can allow them any time in your phone settings.'
          : remindersSupported
            ? 'Your phone will ask for permission next.'
            : 'Reminders work in the phone app, not in the browser.'}
      </ThemedText>
    </OnboardingPage>
  );
}

const styles = StyleSheet.create({
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    boxShadow: '0 4px 16px rgba(59, 42, 74, 0.12)',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  previewText: {
    flex: 1,
    gap: Spacing.half,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  label: {
    flex: 1,
  },
  time: {
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  note: {
    textAlign: 'center',
  },
});
