import { Pressable, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { DragonPortrait } from '@/components/dragon-portrait';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Traits } from '@/constants/dragon';
import { getEgg } from '@/constants/eggs';
import { SKY_PREVIEWS } from '@/constants/sky';
import { Radii, Spacing } from '@/constants/theme';
import { STAGE_RULES } from '@/engine/rules';
import { dayKey, daysBetween } from '@/engine/time';
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

function hatchedLabel(hatchedOn: string) {
  const days = daysBetween(hatchedOn, dayKey(clockNow()));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function CompanionScreen() {
  const theme = useTheme();
  const onboarding = useOnboarding();
  const companionStore = useCompanion();
  const { companion, reset } = companionStore;
  const habits = useHabits();
  const { previewHour, setPreviewHour } = useSky();
  const offset = useClockOffset();

  // Dev only: live through a week in one tap, doing every habit each day and
  // collecting each journey's gift, so the garden can be seen grown.
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
  const { dragonName, traitId, eggId } = onboarding;
  const trait = Traits.find((t) => t.id === traitId);
  const egg = getEgg(eggId);
  const stage = STAGE_RULES[companion?.stage ?? 'baby'];
  const stageDays = companion?.stageDays ?? 0;

  const rows = [
    {
      label: 'Stage',
      value: stage.label,
      detail:
        stage.daysToGrow === null
          ? 'All grown up'
          : `${stageDays} of ${stage.daysToGrow} full-care days to grow up`,
    },
    {
      label: 'Streak',
      value: `${companion?.streak ?? 0} ${companion?.streak === 1 ? 'day' : 'days'}`,
      detail: `Best: ${companion?.bestStreak ?? 0}`,
    },
    trait
      ? { label: 'Trait', value: `${trait.emoji} ${trait.label}`, detail: trait.description }
      : null,
    {
      label: 'Hatched from',
      value: `${egg.label} egg`,
      detail: companion ? hatchedLabel(companion.hatchedOn) : 'Today',
    },
  ].filter((row) => row !== null);

  return (
    <Screen title={dragonName}>
      <View style={styles.hero}>
        <DragonPortrait
          expression={trait?.expression ?? 'neutral'}
          size={170}
          accessibilityLabel={dragonName}
        />
        <ThemedText themeColor="textSecondary">
          {stage.label} dragon{trait ? ` · ${trait.label}` : ''}
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={[
              styles.row,
              i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
            ]}>
            <View style={styles.rowTop}>
              <ThemedText type="small" themeColor="textSecondary">
                {row.label}
              </ThemedText>
              <ThemedText type="smallBold">{row.value}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {row.detail}
            </ThemedText>
          </View>
        ))}
      </View>

      {__DEV__ ? (
        <View style={[styles.devBox, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Time travel (developer)
          </ThemedText>
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
          <View style={styles.devChips}>
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
            <Chip role="button" label="Simulate a week" selected={false} onPress={simulateWeek} />
          </View>
        </View>
      ) : null}

      {__DEV__ ? (
        <View style={[styles.devBox, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Time of day preview (developer)
          </ThemedText>
          <View style={styles.devChips}>
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
      ) : null}

      {__DEV__ ? (
        <Pressable
          onPress={() => {
            reset();
            habits.reset();
            onboarding.reset();
          }}
          accessibilityRole="button"
          style={[styles.devButton, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Start over (developer)
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Forgets the dragon and every answer, then opens onboarding.
          </ThemedText>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.three,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  row: {
    paddingVertical: Spacing.three,
    gap: Spacing.half,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devBox: {
    marginTop: Spacing.five,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radii.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  devChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  devButton: {
    marginTop: Spacing.three,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radii.md,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.half,
  },
});
