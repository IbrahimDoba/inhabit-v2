import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { DragonPortrait } from '@/components/dragon-portrait';
import { MomentPage } from '@/components/moment-page';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { now } from '@/lib/clock';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** One per weekday, so the first day's card depends on when you start. */
const AFFIRMATIONS = [
  'Rest is part of growing too.',
  'Small steps still count.',
  'You are allowed to go slowly.',
  'Be gentle with the person in the mirror.',
  'Showing up is the hard part. You did it.',
  'Tiny wins add up to big changes.',
  'You deserve the care you give others.',
];

export default function DayOneScreen() {
  const theme = useTheme();
  const { dragonName } = useOnboarding();
  const today = new Date(now()).getDay();

  return (
    <MomentPage
      background={theme.momentDark}
      footer={
        <Animated.View entering={FadeIn.delay(1100).duration(400)}>
          <PrimaryButton
            variant="onMoment"
            label="Start today"
            onPress={() => router.push('/onboarding/streak')}
          />
        </Animated.View>
      }>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.onMomentMuted }]}>
          DAY 1
        </ThemedText>
        <ThemedText type="title" style={{ color: theme.onMoment }}>
          Happy {WEEKDAYS[today]}!
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(350).duration(450)}
        style={[styles.card, { backgroundColor: theme.mint }]}>
        <ThemedText type="smallBold" themeColor="inkSecondary" style={styles.eyebrow}>
          A GENTLE REMINDER
        </ThemedText>
        <ThemedText type="subtitle" themeColor="ink" style={styles.center}>
          {AFFIRMATIONS[today]}
        </ThemedText>
        <DragonPortrait expression="happy" size={120} accessibilityLabel={dragonName} />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(800).duration(400)} style={styles.energy}>
        <ThemedText style={styles.bolt}>⚡</ThemedText>
        <ThemedText style={[styles.center, { color: theme.onMoment }]}>
          Fill {dragonName}&apos;s energy today to send it off exploring.
        </ThemedText>
      </Animated.View>
    </MomentPage>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  eyebrow: {
    letterSpacing: 1.5,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radii.lg,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    transform: [{ rotate: '-2deg' }],
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
  },
  center: {
    textAlign: 'center',
  },
  energy: {
    alignItems: 'center',
    gap: Spacing.one,
    maxWidth: 320,
  },
  bolt: {
    fontSize: 28,
    lineHeight: 34,
  },
});
