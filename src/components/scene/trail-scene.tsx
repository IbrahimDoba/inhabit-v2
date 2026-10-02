import { Image } from 'expo-image';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SkyBackdrop } from '@/components/scene/sky-backdrop';
import { NIGHT_SHADE, WARM_LIGHT } from '@/constants/sky';
import type { SkyState } from '@/lib/sky';

const trailFar = require('@/assets/images/scene/trail-far.webp');
const trailNear = require('@/assets/images/scene/trail-near.webp');

/** Source proportions of the tileable strips (width / height). */
const STRIP_ASPECT = 1600 / 909;

type TrailSceneProps = {
  sky: SkyState;
  width: number;
  height: number;
  fadeTo: string;
  /** Space at the top covered by the greeting and bars. */
  topInset?: number;
  /** The walking dragon, placed on the path. */
  children?: ReactNode;
};

/**
 * The world passing by while the dragon explores: far hills drift slowly, the
 * near trail scrolls faster, and the dragon walks on the spot on the path.
 */
export function TrailScene({ sky, width, height, fadeTo, topInset = 0, children }: TrailSceneProps) {
  const nearHeight = Math.min(height * 0.62, width * 0.95);
  const farHeight = nearHeight * 0.8;

  return (
    <View style={[styles.root, { width, height }]}>
      <SkyBackdrop
        sky={sky}
        width={width}
        height={height}
        horizon={height - nearHeight * 0.85}
        topInset={topInset}
      />
      <Strip source={trailFar} height={farHeight} bottom={nearHeight * 0.3} seconds={60} viewWidth={width} />
      <Strip source={trailNear} height={nearHeight} bottom={0} seconds={16} viewWidth={width} />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: WARM_LIGHT, opacity: sky.warmth * 0.16 }]}
        pointerEvents="none"
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: NIGHT_SHADE, opacity: sky.night * 0.45 }]}
        pointerEvents="none"
      />

      <View style={[styles.stage, { paddingBottom: nearHeight * 0.13 }]} pointerEvents="box-none">
        {children}
      </View>

      <Svg style={styles.fade} width={width} height={40} pointerEvents="none">
        <Defs>
          <LinearGradient id="trailFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={fadeTo} stopOpacity={0} />
            <Stop offset="1" stopColor={fadeTo} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={40} fill="url(#trailFade)" />
      </Svg>
    </View>
  );
}

/** Copies of a seamless strip side by side, sliding left one strip width per loop. */
function Strip({
  source,
  height,
  bottom,
  seconds,
  viewWidth,
}: {
  source: number;
  height: number;
  bottom: number;
  seconds: number;
  viewWidth: number;
}) {
  const reduceMotion = useReducedMotion();
  const stripWidth = height * STRIP_ASPECT;
  // Enough copies to cover the view even when shifted by a whole strip.
  const copies = Math.ceil(viewWidth / stripWidth) + 1;
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    x.value = 0;
    x.value = withRepeat(withTiming(1, { duration: seconds * 1000, easing: Easing.linear }), -1);
  }, [x, seconds, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: -x.value * stripWidth }] }));

  return (
    <Animated.View
      style={[styles.strip, { height, bottom, width: stripWidth * copies }, style]}
      pointerEvents="none">
      {Array.from({ length: copies }, (_, i) => (
        <Image key={i} source={source} style={{ width: stripWidth, height }} contentFit="fill" />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  strip: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
  },
  stage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fade: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
});
