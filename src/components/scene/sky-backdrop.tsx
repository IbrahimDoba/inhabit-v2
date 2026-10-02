import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { CLOUD, MOON, MOON_SHADOW, STAR, SUN, SUN_GLOW } from '@/constants/sky';
import type { SkyState } from '@/lib/sky';

type SkyBackdropProps = {
  sky: SkyState;
  width: number;
  height: number;
  /** Where the horizon sits, in points from the top. Sun, moon and stars stay above it. */
  horizon: number;
  /** Space at the top covered by text or bars; the sun and moon stay below it. */
  topInset?: number;
};

/** The sky: gradient by time of day, sun or moon on an arc, stars at night, drifting clouds. */
export function SkyBackdrop({ sky, width, height, horizon, topInset = 0 }: SkyBackdropProps) {
  const skyHeight = horizon;
  const skyShare = horizon / height;
  const open = Math.max(horizon - topInset, 40);

  const body = sky.sun ?? sky.moon;
  const bodyX = body === null ? 0 : width * (0.12 + body * 0.76);
  // Low at the edges of the day, highest at midday, always in the open sky.
  const bodyY = body === null ? 0 : topInset + open * (0.85 - Math.sin(Math.PI * body) * 0.6);

  // Deterministic star field so it never jumps between renders.
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };
        return { x: r(1) * width, y: r(2) * skyHeight * 0.95, size: 0.8 + r(3) * 1.6, group: i % 3 };
      }),
    [width, skyHeight],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={sky.top} />
            <Stop offset={String(skyShare + 0.1)} stopColor={sky.bottom} />
          </LinearGradient>
          <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={SUN_GLOW} stopOpacity={0.8} />
            <Stop offset="1" stopColor={SUN_GLOW} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#sky)" />

        {sky.sun !== null ? (
          <G>
            <Circle cx={bodyX} cy={bodyY} r={56} fill="url(#sunGlow)" />
            <Circle cx={bodyX} cy={bodyY} r={24} fill={SUN} />
          </G>
        ) : null}

        {sky.moon !== null ? (
          <G opacity={Math.min(1, sky.night * 1.4)}>
            <Circle cx={bodyX} cy={bodyY} r={20} fill={MOON} />
            <Circle cx={bodyX - 6} cy={bodyY - 5} r={4} fill={MOON_SHADOW} />
            <Circle cx={bodyX + 7} cy={bodyY + 4} r={3} fill={MOON_SHADOW} />
            <Circle cx={bodyX + 1} cy={bodyY + 10} r={2} fill={MOON_SHADOW} />
          </G>
        ) : null}
      </Svg>

      {sky.night > 0.05
        ? [0, 1, 2].map((group) => (
            <Twinkle key={group} delay={group * 700} opacity={sky.night}>
              <Svg width={width} height={skyHeight}>
                {stars
                  .filter((s) => s.group === group)
                  .map((s, i) => (
                    <Circle key={i} cx={s.x} cy={s.y} r={s.size} fill={STAR} />
                  ))}
              </Svg>
            </Twinkle>
          ))
        : null}

      <Cloud width={width} top={topInset + open * 0.1} scale={1} duration={70000} start={0.15} dim={sky.night} />
      <Cloud width={width} top={topInset + open * 0.55} scale={0.7} duration={95000} start={0.65} dim={sky.night} />
      <Cloud width={width} top={topInset + open * 0.3} scale={0.55} duration={120000} start={0.9} dim={sky.night} />
    </View>
  );
}

function Twinkle({ children, delay, opacity }: { children: React.ReactNode; delay: number; opacity: number }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(0.45, { duration: 1300 }), withTiming(1, { duration: 1300 })),
        -1,
      ),
    );
  }, [t, delay, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: t.value * opacity }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

const CLOUD_W = 120;

/** A soft cloud drifting right to left and wrapping around. */
function Cloud({
  width,
  top,
  scale,
  duration,
  start,
  dim,
}: {
  width: number;
  top: number;
  scale: number;
  duration: number;
  start: number;
  dim: number;
}) {
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(start);
  useEffect(() => {
    if (reduceMotion) return;
    // Finish the current pass, then loop full passes forever.
    x.value = withSequence(
      withTiming(0, { duration: duration * start, easing: Easing.linear }),
      withRepeat(
        withSequence(withTiming(1, { duration: 0 }), withTiming(0, { duration, easing: Easing.linear })),
        -1,
      ),
    );
  }, [x, duration, start, reduceMotion]);
  const travel = width + CLOUD_W * scale;
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * travel - CLOUD_W * scale }],
  }));
  return (
    <Animated.View style={[styles.cloud, { top, opacity: 0.9 - dim * 0.65 }, style]}>
      <Svg width={CLOUD_W * scale} height={50 * scale} viewBox="0 0 120 50">
        <Circle cx={30} cy={32} r={18} fill={CLOUD} />
        <Circle cx={55} cy={22} r={22} fill={CLOUD} />
        <Circle cx={82} cy={30} r={17} fill={CLOUD} />
        <Rect x={20} y={30} width={80} height={20} rx={10} fill={CLOUD} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    left: 0,
  },
});
