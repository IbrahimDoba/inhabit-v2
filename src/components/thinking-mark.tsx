import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

/**
 * Floats beside the dragon while it asks something: a bobbing "?" while it
 * waits, a lightbulb the moment an answer is picked.
 */
export function ThinkingMark({ idea }: { idea: boolean }) {
  const reduceMotion = useReducedMotion();
  const bob = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const ease = Easing.inOut(Easing.sin);
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: ease }),
        withTiming(0, { duration: 700, easing: ease }),
      ),
      -1,
    );
  }, [bob, reduceMotion]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bob.value * 6 }, { rotate: `${(bob.value - 0.5) * 16}deg` }],
  }));

  return (
    <Animated.View style={[styles.mark, bobStyle]} pointerEvents="none" accessible={false}>
      <Animated.View key={idea ? 'idea' : 'ask'} entering={ZoomIn.duration(200)}>
        <ThemedText style={idea ? styles.idea : styles.ask} themeColor="ink">
          {idea ? '💡' : '?'}
        </ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mark: {
    position: 'absolute',
    top: -6,
    right: -22,
  },
  ask: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: Fonts.display,
  },
  idea: {
    fontSize: 28,
    lineHeight: 36,
  },
});
