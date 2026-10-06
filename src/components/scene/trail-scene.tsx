import { Image } from 'expo-image';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { SkyBackdrop } from '@/components/scene/sky-backdrop';
import { ThemedText } from '@/components/themed-text';
import { NIGHT_SHADE, WARM_LIGHT } from '@/constants/sky';
import type { SkyState } from '@/lib/sky';

const trailFar = require('@/assets/images/scene/trail-far.webp');
const trailNear = require('@/assets/images/scene/trail-near.webp');

/** Source proportions of the tileable strips (width / height). */
const STRIP_ASPECT = 1600 / 909;

/** Seconds for each layer to slide by one strip: further away moves slower. */
const FAR_SECONDS = 36;
const NEAR_SECONDS = 9;
/** Foreground plants pass this many points per second, quicker than the trail. */
const FRONT_SPEED = 85;

/** Plants along the bottom edge, in front of the dragon. x is a fraction of one loop. */
const FRONT_PLANTS: readonly { emoji: string; x: number; size: number; drop: number }[] = [
  { emoji: '🌿', x: 0.02, size: 34, drop: 10 },
  { emoji: '🌼', x: 0.16, size: 20, drop: 2 },
  { emoji: '🍄', x: 0.31, size: 24, drop: 4 },
  { emoji: '🌱', x: 0.47, size: 22, drop: 6 },
  { emoji: '🌿', x: 0.6, size: 40, drop: 14 },
  { emoji: '🌸', x: 0.74, size: 18, drop: 0 },
  { emoji: '🌾', x: 0.86, size: 30, drop: 10 },
];

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
export function TrailScene({
  sky,
  width,
  height,
  fadeTo,
  topInset = 0,
  children,
}: TrailSceneProps) {
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
      <Strip
        source={trailFar}
        height={farHeight}
        bottom={nearHeight * 0.3}
        seconds={FAR_SECONDS}
        viewWidth={width}
      />
      <Strip
        source={trailNear}
        height={nearHeight}
        bottom={0}
        seconds={NEAR_SECONDS}
        viewWidth={width}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: WARM_LIGHT, opacity: sky.warmth * 0.16 },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: NIGHT_SHADE, opacity: sky.night * 0.45 },
        ]}
        pointerEvents="none"
      />

      <View style={[styles.stage, { paddingBottom: nearHeight * 0.13 }]} pointerEvents="box-none">
        <Drift>{children}</Drift>
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

      <Foreground viewWidth={width} dim={sky.night * 0.4} />
    </View>
  );
}

/** The walker wanders a little ahead and falls back, so it is not pinned to one spot. */
function Drift({ children }: { children?: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const ease = Easing.inOut(Easing.sin);
    x.set(
      withRepeat(
        withSequence(
          withTiming(16, { duration: 4200, easing: ease }),
          withTiming(-12, { duration: 5200, easing: ease }),
          withTiming(0, { duration: 2600, easing: ease }),
        ),
        -1,
      ),
    );
  }, [x, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  return (
    <Animated.View style={style} pointerEvents="box-none">
      {children}
    </Animated.View>
  );
}

/** Plants sliding past right at the front, quicker than the trail, for depth. */
function Foreground({ viewWidth, dim }: { viewWidth: number; dim: number }) {
  const reduceMotion = useReducedMotion();
  const loop = Math.max(viewWidth * 1.4, 360);
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    x.set(0);
    x.set(
      withRepeat(
        withTiming(1, { duration: (loop / FRONT_SPEED) * 1000, easing: Easing.linear }),
        -1,
      ),
    );
  }, [x, loop, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: -x.get() * loop }] }));
  if (reduceMotion) return null;

  return (
    <Animated.View
      style={[styles.front, { width: loop * 2, opacity: 1 - dim }, style]}
      pointerEvents="none">
      {[0, 1].flatMap((copy) =>
        FRONT_PLANTS.map((p, i) => (
          <ThemedText
            key={`${copy}-${i}`}
            style={[
              styles.frontPlant,
              {
                left: (copy + p.x) * loop,
                bottom: -p.drop,
                fontSize: p.size,
                lineHeight: p.size * 1.2,
              },
            ]}>
            {p.emoji}
          </ThemedText>
        )),
      )}
    </Animated.View>
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
  front: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 60,
  },
  frontPlant: {
    position: 'absolute',
  },
  fade: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
});
