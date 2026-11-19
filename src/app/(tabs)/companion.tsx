import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { DragonPortrait } from '@/components/dragon-portrait';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { BADGE_ART } from '@/constants/badge-art';
import { Traits } from '@/constants/dragon';
import { getEgg } from '@/constants/eggs';
import { Radii, Spacing } from '@/constants/theme';
import { badgeStatuses } from '@/engine/badges';
import { STAGE_RULES } from '@/engine/rules';
import { dayKey, daysBetween } from '@/engine/time';
import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { now as clockNow } from '@/lib/clock';
import { STAGE_THRESHOLDS } from '@/lib/plants';

const BLOOM_AT = STAGE_THRESHOLDS.find((t) => t.stage === 'bloom')?.from ?? 14;

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
  const { log } = useHabits();
  const days = Object.values(log);
  const badges = companion
    ? badgeStatuses(companion, {
        bloomCount: days.filter((d) => new Set(d).size >= BLOOM_AT).length,
        tickCount: days.reduce((sum, d) => sum + d.length, 0),
      })
    : [];
  const earned = badges.filter((b) => b.earned).length;

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

      {badges.length > 0 ? (
        <>
          <View style={styles.badgesHead}>
            <ThemedText type="subtitle">Badges</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {earned} of {badges.length}
            </ThemedText>
          </View>
          <View style={styles.badges}>
            {badges.map(({ badge, earned: has }) => (
              <View
                key={badge.id}
                style={styles.badge}
                accessible
                accessibilityLabel={`${badge.name}. ${has ? 'Earned' : 'Not yet earned'}. ${badge.how}`}
                testID={`badge-${badge.id}`}>
                <View style={[styles.badgeArt, { backgroundColor: theme.surfaceMuted }]}>
                  <Image
                    source={BADGE_ART[badge.id]}
                    style={[styles.badgeImage, !has && styles.locked]}
                    tintColor={has ? undefined : theme.textSecondary}
                    contentFit="contain"
                  />
                </View>
                <ThemedText type="smallBold" style={styles.center} numberOfLines={1}>
                  {badge.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.center} numberOfLines={3}>
                  {badge.how}
                </ThemedText>
              </View>
            ))}
          </View>
        </>
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
  badgesHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: Spacing.three,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.three,
  },
  badge: {
    width: '33.33%',
    alignItems: 'center',
    gap: Spacing.half,
    paddingHorizontal: Spacing.one,
  },
  badgeArt: {
    width: 84,
    height: 84,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    width: 68,
    height: 68,
  },
  // Not yet earned: a faint silhouette.
  locked: {
    opacity: 0.28,
  },
  center: {
    textAlign: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
