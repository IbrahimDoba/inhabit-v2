import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useCountUp } from '@/hooks/use-count-up';
import { useTheme } from '@/hooks/use-theme';

type EnergyBarProps = {
  value: number;
  max: number;
};

/** The dragon's care energy for today. The fill glides and the bolt pops when energy arrives. */
export function EnergyBar({ value, max }: EnergyBarProps) {
  const theme = useTheme();
  const fraction = Math.min(Math.max(value / max, 0), 1);
  const shown = useCountUp(value);
  const fill = useSharedValue(fraction);
  const pop = useSharedValue(1);
  const previous = useRef(value);

  useEffect(() => {
    fill.value = withTiming(fraction, { duration: 600, easing: Easing.out(Easing.cubic) });
    if (value > previous.current) {
      pop.value = withSequence(withSpring(1.5, { damping: 6 }), withSpring(1, { damping: 10 }));
    }
    previous.current = value;
  }, [fraction, value, fill, pop]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const boltStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const full = value >= max;

  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel="Energy"
      accessibilityValue={{ min: 0, max, now: value }}>
      <Animated.View style={boltStyle}>
        <ThemedText style={styles.icon}>⚡</ThemedText>
      </Animated.View>
      <View style={[styles.track, { backgroundColor: theme.primarySoft }]}>
        <Animated.View style={[styles.fill, { backgroundColor: theme.gold }, fillStyle]} />
      </View>
      <ThemedText type="smallBold" themeColor="ink" style={styles.count}>
        {full ? 'Full!' : `${shown}/${max}`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    fontSize: 18,
    lineHeight: 24,
  },
  track: {
    flex: 1,
    height: 14,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  count: {
    minWidth: 44,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
