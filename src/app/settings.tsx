import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { SKY_PREVIEWS } from '@/constants/sky';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { dayKey } from '@/engine/time';
import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useSky } from '@/hooks/use-sky';
import { useTheme } from '@/hooks/use-theme';
import { now as clockNow, resetClock, travel, useClockOffset } from '@/lib/clock';
import { groupForDay } from '@/lib/habits';

const HOUR = 3_600_000;
const TRAVEL_STEPS: readonly { label: string; ms: number }[] = [
  { label: '+1 hour', ms: HOUR },
  { label: '+6 hours', ms: 6 * HOUR },
  { label: '+1 day', ms: 24 * HOUR },
  { label: '+1 week', ms: 7 * 24 * HOUR },
];

function describeOffset(ms: number) {
  if (ms === 0) return 'Real time';
  const hours = Math.round(ms / HOUR);
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return [days ? `${days}d` : '', rest ? `${rest}h` : ''].filter(Boolean).join(' ') + ' ahead';
}

/** App settings, opened from the gear on Home. Developer tools only show in development builds. */
export default function SettingsScreen() {
  const theme = useTheme();
  const onboarding = useOnboarding();
  const companionStore = useCompanion();
  const habits = useHabits();
  const { previewHour, setPreviewHour } = useSky();
  const offset = useClockOffset();
  const [confirmReset, setConfirmReset] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Live through a week in one tap: every due habit each day, each journey's gift collected.
  const simulateWeek = () => {
    for (let day = 0; day < 7; day++) {
      const today = dayKey(clockNow());
      const due = groupForDay(habits.habits ?? [], new Date(clockNow())).flatMap((g) => g.habits);
      for (const habit of due) {
        companionStore.completeHabit(habit.id);
        habits.logDone(habit.id, today);
      }
      companionStore.startJourney();
      companionStore.devFinishJourney();
      companionStore.collectHomecoming();
      travel(24 * HOUR);
      companionStore.checkIn();
    }
  };

  const startOver = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetClock();
    setPreviewHour(null);
    companionStore.reset();
    habits.reset();
    // Last: finishing onboarding's reset sends the app back to the welcome screen.
    onboarding.reset();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <ThemedText type="subtitle">Settings</ThemedText>
        <Pressable onPress={close} accessibilityRole="button" hitSlop={8}>
          <ThemedText themeColor="primary">Done</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {__DEV__ ? (
          <>
            <ThemedText type="smallBold" themeColor="textSecondary">
              DEVELOPER
            </ThemedText>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ThemedText type="smallBold">Start over</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Forgets the dragon, habits, garden and every answer, resets time travel, and opens
                onboarding from the welcome screen.
              </ThemedText>
              <Pressable
                onPress={startOver}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.danger,
                  { backgroundColor: confirmReset ? theme.danger : theme.surfaceMuted },
                  pressed && styles.pressed,
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: confirmReset ? theme.onPrimary : theme.danger }}>
                  {confirmReset ? 'Tap again to erase everything' : 'Start over'}
                </ThemedText>
              </Pressable>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ThemedText type="smallBold">Time travel</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(clockNow()).toLocaleString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                · {describeOffset(offset)}
              </ThemedText>
              <View style={styles.chips}>
                {TRAVEL_STEPS.map((step) => (
                  <Chip
                    key={step.label}
                    role="button"
                    label={step.label}
                    selected={false}
                    onPress={() => travel(step.ms)}
                  />
                ))}
                <Chip role="button" label="Back to real time" selected={offset === 0} onPress={resetClock} />
              </View>
              <Chip role="button" label="Simulate a week" selected={false} onPress={simulateWeek} />
              <ThemedText type="small" themeColor="textSecondary">
                Does every habit, sends the dragon exploring and collects its gift, seven days in a row.
              </ThemedText>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ThemedText type="smallBold">Time of day</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Preview the garden sky without waiting for the clock.
              </ThemedText>
              <View style={styles.chips}>
                <Chip label="Auto" selected={previewHour === null} onPress={() => setPreviewHour(null)} />
                {SKY_PREVIEWS.map((p) => (
                  <Chip
                    key={p.label}
                    label={p.label}
                    selected={previewHour === p.hour}
                    onPress={() => setPreviewHour(p.hour)}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <ThemedText themeColor="textSecondary">More settings are coming soon.</ThemedText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  danger: {
    minHeight: 44,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
