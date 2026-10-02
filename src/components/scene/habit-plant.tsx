import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { PlantSprite } from '@/constants/plant-sprites';

type HabitPlantProps = {
  sprite: PlantSprite;
  /** Size multiplier: smaller further back in the meadow. */
  scale: number;
  /** A stable number per plant so they don't all sway in step. */
  phase: number;
  label: string;
  onPress: () => void;
};

/** One habit's plant, swaying gently from its base. */
export function HabitPlant({ sprite, scale, phase, label, onPress }: HabitPlantProps) {
  const reduceMotion = useReducedMotion();
  const sway = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    sway.value = withDelay(
      phase * 600,
      withRepeat(
        withTiming(1, { duration: 2400 + phase * 500, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [sway, phase, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(sway.value - 0.5) * 5}deg` }],
  }));

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      <Animated.View entering={FadeIn.duration(500)} style={[{ transformOrigin: 'bottom' }, style]}>
        {/* A change of stage cross-fades. */}
        <Image
          source={sprite.source}
          style={{ width: sprite.width * scale, height: sprite.height * scale }}
          contentFit="contain"
          transition={400}
        />
      </Animated.View>
    </Pressable>
  );
}
