import { StyleSheet, View } from 'react-native';

import { DragonPortrait } from '@/components/dragon-portrait';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Traits } from '@/constants/dragon';
import { getEgg } from '@/constants/eggs';
import { Radii, Spacing } from '@/constants/theme';
import { STAGE_RULES } from '@/engine/rules';
import { dayKey, daysBetween } from '@/engine/time';
import { useCompanion } from '@/hooks/use-companion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { now as clockNow } from '@/lib/clock';

function hatchedLabel(hatchedOn: string) {
  const days = daysBetween(hatchedOn, dayKey(clockNow()));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function CompanionScreen() {
  const theme = useTheme();
  const onboarding = useOnboarding();
  const { companion } = useCompanion();

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
});
