import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DragonSprite, type DragonPose } from '@/components/dragon-sprite';
import { GroundShadow } from '@/components/ground-shadow';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import type { Mood } from '@/engine/companion';
import { useTheme } from '@/hooks/use-theme';

const LINES: Record<Mood, readonly string[]> = {
  content: ['Hi! What shall we do today?', 'I saved you a spot in the garden.', 'Ready when you are!'],
  happy: ['That felt good!', 'We make a great team.', 'More energy, more fun!'],
  proud: ['I’m bursting with energy!', 'Look how full I am!', 'Best day ever.'],
  sleepy: ['Zzz… oh, hi.', '*yawns* Still here.', 'Five more minutes…'],
};

const MOOD_MARK: Partial<Record<Mood, string>> = { sleepy: '💤', proud: '✨' };

const SPRITE_HEIGHT = 215;

type DragonStageProps = {
  name: string;
  mood: Mood;
  away: boolean;
  /** Bump to make the dragon hop, e.g. after a habit. */
  hopKey: number;
  onTapWhileAway: () => void;
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
  pose: poseOverride,
  flip = false,
}: DragonStageProps) {
  const pose: DragonPose = poseOverride ?? (away ? 'walk' : 'idle');
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const hop = useSharedValue(0);
  const [line, setLine] = useState<string | null>(null);
  const lineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hopKey === 0 || reduceMotion) return;
    hop.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 7, stiffness: 180 }),
    );
  }, [hopKey, hop, reduceMotion]);

  useEffect(() => () => {
    if (lineTimer.current) clearTimeout(lineTimer.current);
  }, []);

  const hopStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -hop.value * 36 }] }));

  const onTap = () => {
    if (away) {
      onTapWhileAway();
      return;
    }
    const options = LINES[mood];
    setLine(options[Math.floor(Math.random() * options.length)]);
    hop.set(
      reduceMotion
        ? 0
        : withSequence(withTiming(0.5, { duration: 140 }), withSpring(0, { damping: 8 })),
    );
    if (lineTimer.current) clearTimeout(lineTimer.current);
    lineTimer.current = setTimeout(() => setLine(null), 2400);
  };

  const mark = MOOD_MARK[mood];

  return (
    <Pressable
      onPress={onTap}
      style={styles.stage}
      accessibilityRole="button"
      accessibilityLabel={away ? `${name} is out exploring` : `${name}, tap to say hello`}>
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
        <Animated.View style={hopStyle}>
          {/* Keyed, so switching pose crossfades instead of popping. */}
          <Animated.View
            key={`${pose}-${flip}`}
            entering={FadeIn.duration(poseOverride ? 150 : 500)}
            exiting={FadeOut.duration(poseOverride ? 100 : 300)}>
            <DragonSprite pose={pose} flip={flip} height={SPRITE_HEIGHT} />
          </Animated.View>
        </Animated.View>
        <GroundShadow width={110} />
      </View>
    </Pressable>
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
