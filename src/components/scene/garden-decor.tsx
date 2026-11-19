import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { DecorInfo } from '@/constants/decor';
import { NightShade } from '@/components/scene/night-shade';
import { gentleIn } from '@/constants/motion';

type GardenDecorProps = {
  item: DecorInfo;
  /** Width and height of the square it is drawn in, in points. */
  size: number;
  /** 0 by day, 1 at night: lit pieces fade to their night version. */
  night: number;
  /** Just bought: pop in. */
  isNew?: boolean;
};

/**
 * A shop decoration in the garden. Swings and chimes rock from where they hang,
 * fairy lights twinkle and the campfire flickers once it is dark.
 */
export function GardenDecor({ item, size, night, isNew = false }: GardenDecorProps) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  const { motion } = item;

  useEffect(() => {
    if (reduceMotion || motion === 'still') return;
    const duration = motion === 'sway' ? 1900 : motion === 'twinkle' ? 1300 : 420;
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t, motion, reduceMotion]);

  // The dependencies are listed so the styles follow `night` as dusk falls while the garden is open.
  const sway = useAnimatedStyle(
    () => (motion === 'sway' ? { transform: [{ rotate: `${(t.value - 0.5) * 7}deg` }] } : {}),
    [motion],
  );
  const lit = useAnimatedStyle(() => {
    if (motion === 'twinkle') return { opacity: night * (0.6 + 0.4 * t.value) };
    if (motion === 'flicker') {
      return { opacity: night * (0.82 + 0.18 * t.value), transform: [{ scale: 1 + 0.03 * t.value }] };
    }
    return { opacity: night };
  }, [motion, night]);

  return (
    <Animated.View
      entering={isNew ? gentleIn() : FadeIn.duration(500)}
      style={[{ width: size, height: size }, motion === 'sway' && styles.hung, sway]}>
      <Image source={item.source} style={styles.fill} contentFit="contain" contentPosition="bottom" />
      <NightShade source={item.source} night={night} contentPosition="bottom" />
      {item.night && night > 0 ? (
        <Animated.View style={[styles.fill, styles.over, motion === 'flicker' && styles.fire, lit]}>
          <Image source={item.night} style={styles.fill} contentFit="contain" contentPosition="bottom" />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  over: { position: 'absolute', left: 0, top: 0 },
  // Rocks from the top, where it hangs.
  hung: { transformOrigin: 'top' },
  // The flame grows up from the logs.
  fire: { transformOrigin: 'bottom' },
});
