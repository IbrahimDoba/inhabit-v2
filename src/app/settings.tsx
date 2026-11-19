import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { NAME_MAX_LENGTH } from '@/constants/dragon';
import { SKY_PREVIEWS } from '@/constants/sky';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { STAGE_RULES, STAGES } from '@/engine/rules';
import { dayKey } from '@/engine/time';
import { PLUS_JOURNEY_BONUS, PRIVACY_URL } from '@/constants/plus';
import { usePlus } from '@/hooks/use-plus';
import { useCloud } from '@/hooks/use-cloud';
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
  const plus = usePlus();
  const cloud = useCloud();
  const { previewHour, setPreviewHour } = useSky();
  const offset = useClockOffset();
  const [confirmReset, setConfirmReset] = useState(false);
  const [nameDraft, setNameDraft] = useState(onboarding.dragonName);

  // An empty name is never saved: the field goes back to the dragon's name.
  const saveName = () => {
    const name = nameDraft.trim();
    if (name) onboarding.setDragonName(name);
    setNameDraft(name || onboarding.dragonName);
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Live through a week in one tap: every due habit each day, each journey's gift collected.
  const simulateWeek = () => {
    for (let day = 0; day < 7; day++) {
      const today = dayKey(clockNow());
      const due = groupForDay(habits.habits ?? [], new Date(clockNow())).flatMap((g) => g.habits);
      companionStore.setHabitsDue(due.length);
      for (const habit of due) {
        companionStore.completeHabit(habit.id);
        habits.logDone(habit.id, today);
      }
      companionStore.startJourney();
      companionStore.devFinishJourney();
      companionStore.collectHomecoming(plus.isPlus ? PLUS_JOURNEY_BONUS : 0);
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
    plus.setDevPlus(false);
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
        <Pressable
          onPress={() => router.push('/plus')}
          accessibilityRole="button"
          testID="settings-plus"
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold">{plus.isPlus ? '💜 Inhabit Plus is on' : '💜 Inhabit Plus'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {plus.isPlus
              ? 'More diamonds from every journey, and the Plus collection in the shop.'
              : 'More diamonds from every journey, and a few special things for the garden and den.'}
          </ThemedText>
        </Pressable>

        {cloud.available ? (
          <Pressable
            onPress={() => router.push('/account')}
            accessibilityRole="button"
            testID="settings-account"
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">{cloud.email ? '☁️ Saved to your account' : '☁️ Save your dragon'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {cloud.email
                ? cloud.email
                : 'Add an email to keep your garden safe and bring it to a new phone.'}
            </ThemedText>
          </Pressable>
        ) : null}

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="smallBold">Your dragon&apos;s name</ThemedText>
          <TextInput
            value={nameDraft}
            onChangeText={(text) => {
              setNameDraft(text);
              // Saved as it is typed, so closing the sheet mid-edit keeps it.
              if (text.trim()) onboarding.setDragonName(text.trim());
            }}
            onBlur={saveName}
            onSubmitEditing={saveName}
            maxLength={NAME_MAX_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="off"
            returnKeyType="done"
            accessibilityLabel="Dragon name"
            testID="settings-name"
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.surfaceMuted },
            ]}
          />
        </View>

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
              <ThemedText type="smallBold">Inhabit Plus</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Pretend to be a member without the store. {plus.available ? 'This build has a store key.' : 'This build has no store key.'}
              </ThemedText>
              <View style={styles.chips}>
                <Chip label="Free" selected={!plus.devPlus} onPress={() => plus.setDevPlus(false)} />
                <Chip label="Plus" testID="dev-plus-on" selected={plus.devPlus} onPress={() => plus.setDevPlus(true)} />
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <ThemedText type="smallBold">Growth stage</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Jump the dragon to any age to see its art. Each stage has its own portraits and animations.
              </ThemedText>
              <View style={styles.chips}>
                {STAGES.map((stage) => (
                  <Chip
                    key={stage}
                    label={STAGE_RULES[stage].label}
                    selected={companionStore.companion?.stage === stage}
                    onPress={() => companionStore.devSetStage(stage)}
                  />
                ))}
              </View>
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
        ) : null}

        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.aboutHeading}>
          ABOUT
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Emoji graphics by Twemoji (Twitter, Inc. and contributors), licensed under CC-BY 4.0.
        </ThemedText>
        <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link" hitSlop={8}>
          <ThemedText type="small" themeColor="primary">
            Privacy policy
          </ThemedText>
        </Pressable>
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
  input: {
    minHeight: 48,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.heading,
    fontSize: 18,
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
  aboutHeading: {
    marginTop: Spacing.three,
  },
});
