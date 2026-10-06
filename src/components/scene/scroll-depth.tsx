import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

type ScrollDepthProps = {
  /** The scroll position of the screen this scene sits at the top of. */
  scrollY: SharedValue<number>;
  height: number;
  /** Colour the scene fades into as it falls behind the list. */
  fadeTo: string;
  children: ReactNode;
};

/**
 * Gives the scene depth while the list scrolls over it: it drifts up at half
 * speed, eases back a little and fades into the panel, so the list slides
 * across it like a sheet. Pulling down past the top stretches it instead.
 */
export function ScrollDepth({ scrollY, height, fadeTo, children }: ScrollDepthProps) {
  const sceneStyle = useAnimatedStyle(() => {
    const y = scrollY.get();
    if (y < 0) {
      // Overscroll: grow from the bottom edge so the sky never shows a gap.
      const scale = 1 + -y / height;
      return { transform: [{ translateY: y / 2 }, { scale }] };
    }
    const scale = interpolate(y, [0, height], [1, 0.92], Extrapolation.CLAMP);
    return { transform: [{ translateY: y * 0.5 }, { scale }] };
  });
  const washStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.get(),
      [height * 0.1, height * 0.8],
      [0, 0.75],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[styles.layer, { height }, sceneStyle]}>
      {children}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: fadeTo }, washStyle]}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
