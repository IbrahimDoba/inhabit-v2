import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { DragonPortrait } from '@/components/dragon-portrait';
import { MomentPage } from '@/components/moment-page';
import { PrimaryButton } from '@/components/primary-button';
import { SpeechBubble } from '@/components/speech-bubble';
import { IconPebble } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import type { Expression } from '@/constants/dragon';
import { Radii, Spacing } from '@/constants/theme';
import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';

type Goal = {
  days: number;
  emoji: string;
  tagline: string;
  reply: string;
  expression: Expression;
};

const GOALS: readonly Goal[] = [
  { days: 2, emoji: '🙌', tagline: 'A gentle start', reply: 'Two days! Let’s do it together.', expression: 'happy' },
  { days: 5, emoji: '💪', tagline: 'Finding a rhythm', reply: 'Five! I’m getting excited.', expression: 'happy' },
  { days: 7, emoji: '🎯', tagline: 'A whole week', reply: 'A whole week with you? Yes please!', expression: 'proud' },
  { days: 14, emoji: '🔥', tagline: 'Going for it', reply: 'Fourteen?! I’m doing a happy dance!', expression: 'proud' },
];

export default function StreakGoalScreen() {
  const theme = useTheme();
  const { dragonName, habitIds, streakGoal, setStreakGoal, complete } = useOnboarding();
  const { begin } = useCompanion();
  const { seed } = useHabits();
  const selected = GOALS.find((goal) => goal.days === streakGoal);

  return (
    <MomentPage
      footer={
        <PrimaryButton
          variant="onMoment"
          label={selected ? "I'm in!" : 'Pick a goal'}
          onPress={() => {
            begin();
            seed(habitIds);
            complete();
          }}
          disabled={!selected}
        />
      }>
      <ThemedText type="title" style={[styles.center, { color: theme.onMoment }]}>
        How many days in a row will you look after {dragonName}?
      </ThemedText>

      <View style={styles.pet}>
        <DragonPortrait
          expression={selected?.expression ?? 'curious'}
          size={110}
          accessibilityLabel={dragonName}
        />
        <Animated.View key={selected?.days ?? 'none'} entering={FadeIn.duration(200)} style={styles.bubble}>
          <SpeechBubble text={selected?.reply ?? 'No pressure. Any goal makes me happy!'} />
        </Animated.View>
      </View>

      <View style={styles.list} accessibilityRole="radiogroup">
        {GOALS.map((goal) => {
          const isSelected = goal.days === streakGoal;
          return (
            <Pressable
              key={goal.days}
              onPress={() => {
                setStreakGoal(goal.days);
                Haptics.selectionAsync();
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${goal.days} days, ${goal.tagline}`}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: theme.momentCard,
                  borderColor: isSelected ? theme.onMoment : 'transparent',
                },
                pressed && styles.pressed,
              ]}>
              <IconPebble emoji={goal.emoji} size={isSelected ? 46 : 40} />
              <ThemedText type="smallBold" style={[styles.days, { color: theme.onMoment }]}>
                {goal.days} days
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.onMomentMuted }}>
                {goal.tagline}
              </ThemedText>
              {isSelected ? (
                <View style={[styles.check, { backgroundColor: theme.onMoment }]}>
                  <ThemedText type="smallBold" style={{ color: theme.momentBright }}>
                    ✓
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </MomentPage>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
    maxWidth: 340,
  },
  pet: {
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.one,
  },
  bubble: {
    alignSelf: 'stretch',
  },
  list: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.three,
    minHeight: 56,
  },
  days: {
    flex: 1,
    fontSize: 16,
  },
  check: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
