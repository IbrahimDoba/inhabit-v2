import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';

import { DragonSprite } from '@/components/dragon-sprite';
import { GroundShadow } from '@/components/ground-shadow';
import { SunRays } from '@/components/sun-rays';
import { IdleMotion } from '@/components/idle-motion';
import type { Egg } from '@/constants/eggs';
import { useTheme } from '@/hooks/use-theme';


export const TAPS_TO_HATCH = 3;

// Egg art is 150x200 (402x537 source). Crack paths use the same box.
const EGG = { width: 150, height: 200 };
const BASE = { width: 154, height: 143 };
const CAP = { width: 155, height: 120 };
const DRAGON = { width: 180, height: 217 };
const STAGE = { width: 360, height: 260 };

const CRACKS = [
  ['M78 12 L72 26 L80 36 L73 50 L79 60'],
  ['M79 60 L66 70 L58 64 L46 76', 'M79 60 L92 72 L102 66 L114 78', 'M73 50 L60 44'],
  ['M12 82 L24 72 L36 84 L48 72 L60 84 L72 72 L84 84 L96 72 L108 84 L120 72 L132 84 L140 76'],
];
const GLOW_BY_TAPS = [0, 0.25, 0.5, 0.9];

type HatchSceneProps = {
  egg: Egg;
  taps: number;
  onTap: () => void;
  onHatched: () => void;
};

/**
 * The egg cracks a little on each tap. On the last tap it bursts: the cap flies
 * off, the dragon pops out, and the two shell halves land on either side.
 */
export function HatchScene({ egg, taps, onTap, onHatched }: HatchSceneProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [burst, setBurst] = useState(false);
  const burstStarted = useRef(false);

  const shake = useSharedValue(0);
  const glow = useSharedValue(0);
  const flash = useSharedValue(0);
  const eggOpacity = useSharedValue(1);
  const shells = useSharedValue(0);
  const capFly = useSharedValue(0);
  const shellsApart = useSharedValue(0);
  const dragonIn = useSharedValue(0);
  const rays = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    glow.value = withTiming(GLOW_BY_TAPS[Math.min(taps, TAPS_TO_HATCH)], { duration: 300 });
    if (taps === 0 || taps > TAPS_TO_HATCH) return;

    if (taps < TAPS_TO_HATCH) {
      if (!reduceMotion) {
        const s = { duration: 70 };
        shake.value = withSequence(
          withTiming(1, s),
          withTiming(-1, s),
          withTiming(0.7, s),
          withTiming(-0.7, s),
          withTiming(0, s),
        );
      }
      return;
    }

    if (burstStarted.current) return;
    burstStarted.current = true;
    setBurst(true);

    if (reduceMotion) {
      eggOpacity.value = withTiming(0, { duration: 300 });
      shells.value = withTiming(1, { duration: 300 });
      capFly.value = 1;
      shellsApart.value = 1;
      dragonIn.value = withTiming(1, { duration: 300 });
      rays.value = withTiming(1, { duration: 300 });
    } else {
      const out = Easing.out(Easing.cubic);
      flash.value = withSequence(withTiming(1, { duration: 140 }), withTiming(0, { duration: 700 }));
      eggOpacity.value = withDelay(120, withTiming(0, { duration: 0 }));
      shells.value = withDelay(120, withTiming(1, { duration: 0 }));
      capFly.value = withDelay(120, withTiming(1, { duration: 900, easing: Easing.linear }));
      dragonIn.value = withDelay(260, withSpring(1, { damping: 9, stiffness: 120 }));
      shellsApart.value = withDelay(700, withTiming(1, { duration: 600, easing: out }));
      rays.value = withDelay(200, withTiming(1, { duration: 600, easing: out }));
      spin.value = withRepeat(withTiming(1, { duration: 24000, easing: Easing.linear }), -1);
    }
    // Let the landing settle before the screen moves on. Not cleared on
    // re-render: the burst runs once and must always finish.
    setTimeout(onHatched, reduceMotion ? 500 : 1500);
  }, [taps, reduceMotion, onHatched, shake, glow, flash, eggOpacity, shells, capFly, shellsApart, dragonIn, rays, spin]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shake.value * 8}deg` }, { translateX: shake.value * 3 }],
    opacity: eggOpacity.value,
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
    transform: [{ scale: 0.4 + flash.value * 1.8 }],
  }));
  const raysStyle = useAnimatedStyle(() => ({
    opacity: rays.value * 0.9,
    transform: [{ rotate: `${spin.value * 360}deg` }, { scale: 0.6 + rays.value * 0.4 }],
  }));
  const baseStyle = useAnimatedStyle(() => ({
    opacity: shells.value,
    transform: [
      { translateX: shellsApart.value * -135 },
      { rotate: `${shellsApart.value * -8}deg` },
      { scale: 1 - shellsApart.value * 0.3 },
    ],
  }));
  const capStyle = useAnimatedStyle(() => {
    // Up and over in an arc, landing on the grass to the right.
    const t = capFly.value;
    const arc = -4 * 150 * t * (1 - t);
    return {
      opacity: shells.value,
      transform: [
        { translateX: t * 135 },
        { translateY: arc + t * 100 },
        { rotate: `${t * 200}deg` },
        { scale: 1 - t * 0.3 },
      ],
    };
  });
  const dragonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(dragonIn.value * 3, 1),
    transform: [{ translateY: (1 - dragonIn.value) * 70 }, { scale: 0.4 + dragonIn.value * 0.6 }],
  }));

  const canTap = taps < TAPS_TO_HATCH;

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
        <SunRays />
      </Animated.View>

      {burst ? (
        <>
          <Animated.View style={[styles.dragonWrap, dragonStyle]}>
            <DragonSprite height={DRAGON.height} accessibilityLabel="Your baby dragon, just hatched" />
          </Animated.View>
          <Animated.View style={[styles.base, baseStyle]} pointerEvents="none">
            <Image source={egg.shellBase} style={BASE} contentFit="contain" />
          </Animated.View>
          <Animated.View style={[styles.cap, capStyle]} pointerEvents="none">
            <Image source={egg.shellCap} style={CAP} contentFit="contain" />
          </Animated.View>
        </>
      ) : null}

      <Pressable
        onPress={() => {
          if (!canTap) return;
          Haptics.impactAsync(
            taps + 1 === TAPS_TO_HATCH
              ? Haptics.ImpactFeedbackStyle.Heavy
              : Haptics.ImpactFeedbackStyle.Medium,
          );
          if (taps + 1 === TAPS_TO_HATCH) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          onTap();
        }}
        disabled={!canTap}
        accessibilityRole="button"
        accessibilityLabel={`${egg.label} egg`}
        accessibilityHint="Tap to help it hatch"
        style={styles.eggWrap}>
        <IdleMotion kind="wobble">
          <Animated.View style={[EGG, shakeStyle]}>
            <Image source={egg.image} style={EGG} contentFit="contain" />
            <Animated.View style={[StyleSheet.absoluteFill, glowStyle]} pointerEvents="none">
              <Svg width={EGG.width} height={EGG.height} viewBox="0 0 150 200">
                <Defs>
                  <RadialGradient id="glow" cx="50%" cy="45%" r="50%">
                    <Stop offset="0" stopColor={theme.burst} stopOpacity={0.9} />
                    <Stop offset="0.6" stopColor={theme.gold} stopOpacity={0.35} />
                    <Stop offset="1" stopColor={theme.gold} stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                <Ellipse cx={75} cy={95} rx={55} ry={70} fill="url(#glow)" />
              </Svg>
            </Animated.View>
            {CRACKS.slice(0, Math.min(taps, TAPS_TO_HATCH)).map((paths, stage) => (
              <Animated.View
                key={stage}
                entering={FadeIn.duration(150)}
                style={StyleSheet.absoluteFill}
                pointerEvents="none">
                <Svg width={EGG.width} height={EGG.height} viewBox="0 0 150 200">
                  {paths.map((d) => (
                    <Path
                      key={d}
                      d={d}
                      stroke={taps >= 2 ? theme.gold : theme.crack}
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                    />
                  ))}
                </Svg>
              </Animated.View>
            ))}
          </Animated.View>
        </IdleMotion>
      </Pressable>

      <Animated.View
        style={[styles.flash, { backgroundColor: theme.burst, boxShadow: `0 0 60px 40px ${theme.burst}` }, flashStyle]}
        pointerEvents="none"
      />

      <View style={styles.shadow} pointerEvents="none">
        <GroundShadow width={110} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: STAGE.width,
    height: STAGE.height,
    alignSelf: 'center',
  },
  rays: {
    position: 'absolute',
    width: 420,
    height: 420,
    left: (STAGE.width - 420) / 2,
    top: STAGE.height - EGG.height / 2 - 210 - 10,
  },
  eggWrap: {
    position: 'absolute',
    bottom: 0,
    left: (STAGE.width - EGG.width) / 2,
  },
  dragonWrap: {
    position: 'absolute',
    bottom: -4,
    left: (STAGE.width - DRAGON.width) / 2,
  },
  base: {
    position: 'absolute',
    bottom: -4,
    left: (STAGE.width - BASE.width) / 2,
    transformOrigin: 'bottom',
  },
  cap: {
    position: 'absolute',
    bottom: 100,
    left: (STAGE.width - CAP.width) / 2,
  },
  flash: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    left: (STAGE.width - 160) / 2,
    bottom: EGG.height / 2 - 80,
  },
  shadow: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
});
