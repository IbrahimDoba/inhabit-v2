import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { NUDGE } from '@/constants/motion';
import { useCountUp } from '@/hooks/use-count-up';
import { useTheme } from '@/hooks/use-theme';

/** The diamond balance. Counts up and bounces when diamonds arrive. */
export function DiamondPill({ diamonds }: { diamonds: number }) {
  const theme = useTheme();
  const shown = useCountUp(diamonds, 900);
  const bounce = useSharedValue(1);
  const previous = useRef(diamonds);

  useEffect(() => {
    if (diamonds > previous.current) {
      bounce.value = withSequence(
        withTiming(NUDGE, { duration: 160, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 240, easing: Easing.inOut(Easing.quad) }),
      );
    }
    previous.current = diamonds;
  }, [diamonds, bounce]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: bounce.value }] }));

  return (
    <Animated.View
      style={[styles.pill, { backgroundColor: theme.artCard }, style]}
      accessibilityLabel={`${diamonds} diamonds`}>
      <ThemedText style={styles.gem}>💎</ThemedText>
      <ThemedText type="smallBold" themeColor="ink" style={styles.count}>
        {shown}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  gem: {
    fontSize: 16,
    lineHeight: 22,
  },
  count: {
    fontVariant: ['tabular-nums'],
  },
});
