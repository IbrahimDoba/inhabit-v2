import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonPortrait } from '@/components/dragon-portrait';
import { GardenBackdrop } from '@/components/garden-backdrop';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { suggestedHabitIds, suggestedReminder } from '@/lib/starter-plan';

const STEP_MS = 800;
const RING = 170;

export default function PlanScreen() {
  const theme = useTheme();
  const { dragonName, userName, quizAnswers, setHabitIds, reminderId, setReminderId } =
    useOnboarding();
  const [shown, setShown] = useState(0);
  const spin = useSharedValue(0);

  const steps = [
    'Looking at what you want help with',
    'Keeping every habit small',
    'Choosing a good time to check in',
  ];

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.linear }), -1);
    setHabitIds(suggestedHabitIds(quizAnswers));
    const reminder = suggestedReminder(quizAnswers);
    if (reminder && !reminderId) setReminderId(reminder);

    const timers = steps.map((_, i) => setTimeout(() => setShown(i + 1), (i + 1) * STEP_MS));
    timers.push(
      setTimeout(() => router.replace('/onboarding/habits'), (steps.length + 1) * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
    // Runs once on arrival; the answers are final by now.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.root}>
        <ThemedText type="title" themeColor="ink" style={styles.center}>
          {dragonName} is making a plan{userName ? ` for ${userName}` : ''}
        </ThemedText>

        <View style={styles.ringWrap}>
          <Animated.View
            style={[
              styles.ring,
              { borderColor: theme.primarySoft, borderTopColor: theme.primary },
              ringStyle,
            ]}
          />
          <DragonPortrait expression="proud" size={RING - 24} accessibilityLabel={dragonName} />
        </View>

        <View style={styles.steps} accessibilityLiveRegion="polite">
          {steps.slice(0, shown).map((step) => (
            <Animated.View key={step} entering={FadeIn.duration(250)} style={styles.step}>
              <ThemedText style={{ color: theme.mintDeep }}>✓</ThemedText>
              <ThemedText themeColor="ink">{step}</ThemedText>
            </Animated.View>
          ))}
        </View>
      </SafeAreaView>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    alignItems: 'center',
    gap: Spacing.five,
  },
  center: {
    textAlign: 'center',
    maxWidth: 340,
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 6,
  },
  steps: {
    gap: Spacing.two,
    alignSelf: 'stretch',
    minHeight: 110,
  },
  step: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
});
