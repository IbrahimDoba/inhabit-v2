import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { IconTile } from '@/components/icon';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import type { QuestStatus } from '@/engine/quests';
import { useCompanion } from '@/hooks/use-companion';
import { useNow } from '@/hooks/use-now';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useQuests } from '@/hooks/use-quests';
import { useTheme } from '@/hooks/use-theme';

function untilMidnight(now: number) {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const mins = Math.max(0, Math.round((midnight.getTime() - now) / 60000));
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
}

export default function QuestsScreen() {
  const theme = useTheme();
  const { dragonName } = useOnboarding();
  const { companion, claimQuest } = useCompanion();
  const { ctx, statuses } = useQuests();
  const now = useNow(true, 60_000);
  const [justClaimed, setJustClaimed] = useState<{ id: string; reward: number } | null>(null);

  const daily = statuses.filter((s) => s.quest.kind === 'daily');
  // Unclaimed finished ones first, then in progress, then claimed.
  const special = statuses
    .filter((s) => s.quest.kind === 'special')
    .sort((a, b) => rank(a) - rank(b));

  const claim = (id: string, reward: number) => {
    const events = claimQuest(id, ctx);
    if (events.some((e) => e.type === 'diamonds' && e.reason === 'quest')) {
      setJustClaimed({ id, reward });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const fill = (text: string) => text.replaceAll('{pet}', dragonName);

  return (
    <Screen title="Quests" hint="Small goals that earn diamonds.">
      <View style={[styles.balance, { backgroundColor: theme.primarySoft }]}>
        <ThemedText style={styles.gem}>💎</ThemedText>
        <ThemedText type="subtitle">{companion?.diamonds ?? 0}</ThemedText>
        {justClaimed ? (
          <Animated.View key={justClaimed.id} entering={ZoomIn.springify().damping(10)}>
            <ThemedText type="smallBold" themeColor="primary">
              +{justClaimed.reward}
            </ThemedText>
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">Today</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          New quests in {untilMidnight(now)}
        </ThemedText>
      </View>
      <View style={styles.list}>
        {daily.map((s) => (
          <QuestCard key={s.quest.id} status={s} fill={fill} onClaim={claim} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">Milestones</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {special.filter((s) => s.claimed).length} of {special.length} done
        </ThemedText>
      </View>
      <View style={styles.list}>
        {special.map((s) => (
          <QuestCard key={s.quest.id} status={s} fill={fill} onClaim={claim} />
        ))}
      </View>
    </Screen>
  );
}

function rank(s: QuestStatus) {
  if (s.done && !s.claimed) return 0;
  if (!s.claimed) return 1;
  return 2;
}

/** A steady tile colour per quest, so each keeps its colour and neighbours tend to differ. */
function toneFor(id: string) {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function QuestCard({
  status,
  fill,
  onClaim,
}: {
  status: QuestStatus;
  fill: (text: string) => string;
  onClaim: (id: string, reward: number) => void;
}) {
  const theme = useTheme();
  const { quest, progress, done, claimed } = status;
  const ready = done && !claimed;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: ready ? theme.primarySoft : theme.surface,
          borderColor: ready ? theme.primary : theme.border,
        },
        claimed && styles.claimedCard,
      ]}>
      <View style={claimed && styles.faded}>
        <IconTile emoji={quest.emoji} size={50} tone={toneFor(quest.id)} />
      </View>
      <View style={styles.text}>
        <ThemedText type="smallBold" style={claimed && styles.struck}>
          {fill(quest.title)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {fill(quest.hint)}
        </ThemedText>
        {quest.goal > 1 && !claimed ? (
          <View style={styles.progressRow}>
            <View style={[styles.track, { backgroundColor: theme.surfaceMuted }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${(progress / quest.goal) * 100}%`, backgroundColor: theme.gold },
                ]}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.count}>
              {progress}/{quest.goal}
            </ThemedText>
          </View>
        ) : null}
      </View>
      {ready ? (
        <Pressable
          onPress={() => onClaim(quest.id, quest.reward)}
          accessibilityRole="button"
          accessibilityLabel={`Claim ${quest.reward} diamonds`}
          style={({ pressed }) => [styles.claim, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
          <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
            Claim 💎{quest.reward}
          </ThemedText>
        </Pressable>
      ) : claimed ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.reward}>
          <ThemedText type="smallBold" themeColor="primary">
            ✓ Done
          </ThemedText>
        </Animated.View>
      ) : (
        <View style={styles.reward}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            💎 {quest.reward}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  gem: {
    fontSize: 20,
    lineHeight: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
  },
  list: {
    gap: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  claimedCard: {
    opacity: 0.6,
  },
  faded: {
    opacity: 0.55,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  count: {
    fontVariant: ['tabular-nums'],
  },
  claim: {
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  reward: {
    minWidth: 56,
    alignItems: 'flex-end',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
