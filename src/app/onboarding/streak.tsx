import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { DragonSprite } from '@/components/dragon-sprite';
import { MomentPage } from '@/components/moment-page';
import { PrimaryButton } from '@/components/primary-button';
import { SunRays } from '@/components/sun-rays';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { now } from '@/lib/clock';


const FLIP_AT = 700;
/** Monday first. */
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreakScreen() {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { dragonName } = useOnboarding();
  const [flipped, setFlipped] = useState(false);
  const todayIndex = (new Date(now()).getDay() + 6) % 7;

  const lit = useSharedValue(0);
  const drop = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFlipped(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, FLIP_AT);
    lit.value = withDelay(FLIP_AT, withTiming(1, { duration: 400 }));
    drop.value = reduceMotion
      ? withDelay(FLIP_AT, withTiming(1, { duration: 300 }))
      : withDelay(FLIP_AT + 150, withSpring(1, { damping: 10, stiffness: 140 }));
    if (!reduceMotion) {
      spin.value = withRepeat(withTiming(1, { duration: 30000, easing: Easing.linear }), -1);
    }
    return () => clearTimeout(timer);
  }, [lit, drop, spin, reduceMotion]);

  const background = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(lit.value, [0, 1], [theme.momentDark, theme.momentBright]),
  }));
  const dragonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(drop.value * 2, 1),
    transform: [{ translateY: (1 - drop.value) * -80 }],
  }));
  const raysStyle = useAnimatedStyle(() => ({
    opacity: lit.value * 0.8,
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <MomentPage
      background={background}
      footer={
        flipped ? (
          <Animated.View entering={FadeIn.delay(900).duration(400)}>
            <PrimaryButton
              variant="onMoment"
              label="Let's go!"
              onPress={() => router.push('/onboarding/streak-goal')}
            />
          </Animated.View>
        ) : null
      }>
      <View style={styles.stage}>
        <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
          <SunRays />
        </Animated.View>
        <Animated.View style={dragonStyle}>
          <DragonSprite height={185} accessibilityLabel={dragonName} />
        </Animated.View>
      </View>

      <View
        style={styles.counter}
        accessible
        accessibilityLabel={flipped ? '1 day streak' : '0 day streak'}>
        <Animated.View key={flipped ? 'one' : 'zero'} entering={ZoomIn.duration(300)}>
          <ThemedText
            style={[styles.number, { color: flipped ? theme.onMoment : theme.onMomentMuted }]}>
            {flipped ? '1' : '0'}
          </ThemedText>
        </Animated.View>
        <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.onMomentMuted }]}>
          DAY STREAK
        </ThemedText>
      </View>

      {flipped ? (
        <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.after}>
          <View style={[styles.week, { backgroundColor: theme.momentCard }]}>
            {DAYS.map((day, i) => (
              <View key={i} style={styles.day}>
                <ThemedText type="small" style={{ color: theme.onMomentMuted }}>
                  {day}
                </ThemedText>
                {i === todayIndex ? (
                  <View style={[styles.tick, { backgroundColor: theme.onMoment }]}>
                    <ThemedText type="smallBold" style={{ color: theme.momentBright }}>
                      ✓
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.dot, { backgroundColor: theme.momentCard }]} />
                )}
              </View>
            ))}
          </View>
          <ThemedText style={[styles.center, { color: theme.onMoment }]}>
            Great start! Open Inhabit tomorrow and {dragonName} will make it two.
          </ThemedText>
        </Animated.View>
      ) : null}
    </MomentPage>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 240,
    height: 200,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rays: {
    position: 'absolute',
    width: 420,
    height: 420,
    top: 100 - 210,
    left: 120 - 210,
  },
  counter: {
    alignItems: 'center',
  },
  number: {
    fontSize: 96,
    lineHeight: 104,
    fontFamily: Fonts.display,
  },
  eyebrow: {
    letterSpacing: 2,
  },
  after: {
    alignItems: 'center',
    gap: Spacing.four,
    width: '100%',
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    borderRadius: 20,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  day: {
    alignItems: 'center',
    gap: Spacing.two,
    width: 32,
  },
  tick: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginVertical: 9,
  },
  center: {
    textAlign: 'center',
    maxWidth: 320,
  },
});
