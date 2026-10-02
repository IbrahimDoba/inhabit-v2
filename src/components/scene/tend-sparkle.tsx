import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

const BITS: readonly { emoji: string; dx: number; delay: number; fall: boolean }[] = [
  { emoji: '✨', dx: 18, delay: 1300, fall: false },
  { emoji: '💚', dx: -16, delay: 1600, fall: false },
  { emoji: '✨', dx: -2, delay: 1900, fall: false },
];

/** After the watering, sparkles and a heart rise from the plant. */
export function TendSparkle() {
  return (
    <View style={styles.origin}>
      {BITS.map((bit, i) => (
        <Bit key={i} {...bit} />
      ))}
    </View>
  );
}

function Bit({ emoji, dx, delay, fall }: { emoji: string; dx: number; delay: number; fall: boolean }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    t.set(withDelay(delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) })));
  }, [t, delay, reduceMotion]);

  const style = useAnimatedStyle(() => {
    const v = t.get();
    return {
      opacity: v < 0.1 ? v * 10 : 1 - Math.max(0, v - 0.6) / 0.4,
      transform: [
        { translateX: dx },
        { translateY: fall ? -30 + v * 40 : -v * 36 },
        { scale: fall ? 1 : 0.6 + v * 0.5 },
      ],
    };
  });

  return (
    <Animated.View style={[styles.bit, style]}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  origin: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  bit: {
    position: 'absolute',
    left: -10,
    top: -12,
  },
  emoji: {
    fontSize: 18,
    lineHeight: 24,
  },
});
