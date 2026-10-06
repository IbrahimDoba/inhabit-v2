import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DragonPoses, type DragonPose } from '@/components/dragon-sprite';
import { GroundShadow } from '@/components/ground-shadow';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import type { Mood } from '@/engine/companion';
import { useTheme } from '@/hooks/use-theme';

const LINES: Record<Mood, readonly string[]> = {
  content: ['Hi! What shall we do today?', 'I saved you a spot in the garden.', 'Ready when you are!'],
  happy: ['That felt good!', 'We make a great team.', 'More energy, more fun!'],
  proud: ['I’m bursting with energy!', 'Look how full I am!', 'Best day ever.'],
  sleepy: ['Zzz… oh, hi.', '*yawns* Still here.', 'Five more minutes…'],
};

/** Taps this close together count as one burst of fuss. */
const COMBO_MS = 900;
const TICKLED = ['Hehe, that tickles!', 'Again! Again!', 'You’re the best!'];
const HEART_LIFE_MS = 1300;
const HEARTS = ['💜', '💕', '💗'];
/** Woken at night, it stays up this long after the last tap, then curls up again. */
const AWAKE_MS = 25_000;
const WOKEN = ['*yawns* Oh, hi…', 'Mm? Is it morning?', '*stretches* Still here.', 'Five more minutes…'];

const MOOD_MARK: Partial<Record<Mood, string>> = { sleepy: '💤', proud: '✨' };

const SPRITE_HEIGHT = 215;
// The bundle walk is here too, for walking back into the garden after exploring.
const HOME_POSES: readonly DragonPose[] = ['idle', 'sleep', 'stroll', 'water', 'walk'];
const AWAY_POSES: readonly DragonPose[] = ['walk'];

type DragonStageProps = {
  name: string;
  mood: Mood;
  away: boolean;
  /** Bump to make the dragon hop, e.g. after a habit. */
  hopKey: number;
  onTapWhileAway: () => void;
  /** Called when tapped hello at home. */
  onGreet?: () => void;
  /** Overrides the pose, e.g. walking over to a plant in the garden. */
  pose?: DragonPose;
  flip?: boolean;
};

/**
 * The dragon in the garden: its idle loop at home, its walk loop (stick and
 * bundle over the shoulder) while it is out exploring.
 */
export function DragonStage({
  name,
  mood,
  away,
  hopKey,
  onTapWhileAway,
  onGreet,
  pose: poseOverride,
  flip = false,
}: DragonStageProps) {
  const [awake, setAwake] = useState(false);
  const awakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // At night the dragon sleeps curled up in the garden until you tap it.
  const sleeping = mood === 'sleepy' && !away && !awake;
  const pose: DragonPose = poseOverride ?? (away ? 'walk' : sleeping ? 'sleep' : 'idle');
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const hop = useSharedValue(0);
  const squash = useSharedValue(0);
  const tilt = useSharedValue(0);
  const [line, setLine] = useState<string | null>(null);
  const lineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hearts, setHearts] = useState<{ id: number; dx: number; delay: number }[]>([]);
  const nextHeart = useRef(1);
  const combo = useRef({ count: 0, at: 0 });

  useEffect(() => {
    if (hopKey === 0 || reduceMotion) return;
    hop.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 7, stiffness: 180 }),
    );
  }, [hopKey, hop, reduceMotion]);

  useEffect(() => () => {
    if (lineTimer.current) clearTimeout(lineTimer.current);
    if (awakeTimer.current) clearTimeout(awakeTimer.current);
  }, []);

  const hopStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -hop.value * 36 },
      { rotate: `${tilt.value}deg` },
      { scaleX: 1 + squash.value * 0.12 },
      { scaleY: 1 - squash.value * 0.12 },
    ],
  }));

  const addHearts = (count: number) => {
    const fresh = Array.from({ length: count }, (_, i) => ({
      id: nextHeart.current++,
      dx: (i - (count - 1) / 2) * 26 + (Math.random() - 0.5) * 14,
      delay: i * 90,
    }));
    setHearts((all) => [...all, ...fresh]);
    const ids = new Set(fresh.map((h) => h.id));
    setTimeout(
      () => setHearts((all) => all.filter((h) => !ids.has(h.id))),
      HEART_LIFE_MS + count * 90,
    );
  };

  const onTap = () => {
    if (away) {
      onTapWhileAway();
      return;
    }
    onGreet?.();
    if (mood === 'sleepy') {
      if (awakeTimer.current) clearTimeout(awakeTimer.current);
      awakeTimer.current = setTimeout(() => setAwake(false), AWAKE_MS);
    }
    if (sleeping) {
      // Wakes with a big stretch and a yawn.
      setAwake(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      combo.current = { count: 0, at: 0 };
      setLine(WOKEN[Math.floor(Math.random() * WOKEN.length)]);
      if (lineTimer.current) clearTimeout(lineTimer.current);
      lineTimer.current = setTimeout(() => setLine(null), 2400);
      if (!reduceMotion) {
        squash.set(
          withSequence(
            withTiming(0.5, { duration: 120 }),
            withTiming(-1, { duration: 380, easing: Easing.out(Easing.quad) }),
            withDelay(250, withSpring(0, { damping: 7 })),
          ),
        );
      }
      return;
    }
    const now = Date.now();
    const taps = now - combo.current.at < COMBO_MS ? combo.current.count + 1 : 1;
    combo.current = { count: taps, at: now };
    const tickled = taps >= 3;
    Haptics.impactAsync(
      tickled ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    );
    const options = tickled ? TICKLED : LINES[mood];
    setLine(options[Math.floor(Math.random() * options.length)]);
    addHearts(tickled ? 5 : taps === 2 ? 2 : 3);
    if (reduceMotion) return;
    if (tickled) {
      // A big happy jump: crouch, spring up, land with a squish.
      squash.set(
        withSequence(
          withTiming(1, { duration: 120 }),
          withTiming(-0.6, { duration: 160 }),
          withDelay(220, withTiming(0.7, { duration: 90 })),
          withSpring(0, { damping: 6 }),
        ),
      );
      hop.set(
        withSequence(
          withDelay(120, withTiming(1.6, { duration: 260, easing: Easing.out(Easing.quad) })),
          withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }),
        ),
      );
    } else if (taps === 2) {
      // A giggly wiggle.
      tilt.set(
        withSequence(
          withTiming(-7, { duration: 80 }),
          withTiming(7, { duration: 110 }),
          withTiming(-5, { duration: 100 }),
          withTiming(4, { duration: 90 }),
          withSpring(0, { damping: 8 }),
        ),
      );
    } else {
      // Squish down, bounce up.
      squash.set(withSequence(withTiming(1, { duration: 110 }), withSpring(0, { damping: 5 })));
      hop.set(withSequence(withTiming(0.5, { duration: 140 }), withSpring(0, { damping: 8 })));
    }
    if (lineTimer.current) clearTimeout(lineTimer.current);
    lineTimer.current = setTimeout(() => setLine(null), 2400);
  };

  const mark = mood === 'sleepy' ? undefined : MOOD_MARK[mood];

  return (
    <Pressable
      onPress={onTap}
      style={styles.stage}
      accessibilityRole="button"
      accessibilityLabel={
        away
          ? `${name} is out exploring`
          : sleeping
            ? `${name} is asleep, tap to wake them`
            : `${name}, tap to say hello`
      }>
      {line && !away ? (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(200)}
          style={[styles.bubble, { backgroundColor: theme.bubble }]}>
          <ThemedText type="smallBold" themeColor="ink" style={styles.center}>
            {line}
          </ThemedText>
        </Animated.View>
      ) : null}

      {away ? (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.tag, { backgroundColor: theme.artCard }]}>
          <ThemedText type="smallBold" themeColor="ink">
            🗺️ Exploring…
          </ThemedText>
        </Animated.View>
      ) : null}

      <View style={styles.body}>
        {mark && !away && !poseOverride ? <MoodMark mark={mark} /> : null}
        {sleeping && !poseOverride ? <SleepZs /> : null}
        {hearts.map((h) => (
          <Heart key={h.id} dx={h.dx} delay={h.delay} icon={HEARTS[h.id % HEARTS.length]} />
        ))}
        <Animated.View style={[styles.hopper, hopStyle]}>
          {/* Home poses stay loaded; exploring has its own walk with the bundle. */}
          <DragonPoses
            pose={pose}
            poses={away ? AWAY_POSES : HOME_POSES}
            flip={flip}
            height={SPRITE_HEIGHT}
          />
        </Animated.View>
        <GroundShadow width={110} />
      </View>
    </Pressable>
  );
}

/** One heart floating up from the dragon's head and fading out. */
function Heart({ dx, delay, icon }: { dx: number; delay: number; icon: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) })));
  }, [t, delay]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p === 0 ? 0 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3,
      transform: [
        { translateX: dx + Math.sin(p * Math.PI * 2) * 6 },
        { translateY: -p * 90 },
        { scale: 0.5 + Math.min(p * 3, 1) * 0.6 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.heart, style]} pointerEvents="none">
      <ThemedText style={styles.heartText}>{icon}</ThemedText>
    </Animated.View>
  );
}

/** Little z's drifting up from the sleeping dragon, one after another. */
function SleepZs() {
  return (
    <View style={styles.zs} pointerEvents="none">
      {[0, 1, 2].map((i) => (
        <SleepZ key={i} index={i} />
      ))}
    </View>
  );
}

function SleepZ({ index }: { index: number }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(reduceMotion ? 0.5 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    t.set(
      withDelay(
        index * 1000,
        withRepeat(withTiming(1, { duration: 3000, easing: Easing.out(Easing.sin) }), -1),
      ),
    );
  }, [t, index, reduceMotion]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85,
      transform: [
        { translateX: p * 26 + Math.sin(p * Math.PI * 2) * 5 },
        { translateY: -p * 70 },
        { scale: 0.6 + p * 0.7 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.z, style]}>
      <ThemedText style={[styles.zText, { color: theme.onMoment }]}>z</ThemedText>
    </Animated.View>
  );
}

function MoodMark({ mark }: { mark: string }) {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [float]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -float.value * 8 }],
    opacity: 0.6 + float.value * 0.4,
  }));
  return (
    <Animated.View style={[styles.mark, style]} pointerEvents="none">
      <ThemedText style={styles.markText}>{mark}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  body: {
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    top: 0,
    maxWidth: 240,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    zIndex: 2,
  },
  tag: {
    position: 'absolute',
    top: 8,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    zIndex: 2,
  },
  center: {
    textAlign: 'center',
  },
  hopper: {
    transformOrigin: 'bottom',
  },
  heart: {
    position: 'absolute',
    top: 40,
    zIndex: 3,
  },
  heartText: {
    fontSize: 22,
    lineHeight: 28,
  },
  // Just above the sleeping dragon's head, which lies left of centre.
  zs: {
    position: 'absolute',
    top: 64,
    left: '50%',
    marginLeft: -24,
    zIndex: 3,
  },
  z: {
    position: 'absolute',
  },
  zText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    textShadowColor: 'rgba(59, 42, 74, 0.45)',
    textShadowRadius: 4,
  },
  mark: {
    position: 'absolute',
    top: 0,
    right: 6,
    zIndex: 1,
  },
  markText: {
    fontSize: 26,
    lineHeight: 32,
  },
});
