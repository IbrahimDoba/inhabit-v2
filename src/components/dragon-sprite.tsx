import { Image, type ImageStyle } from 'expo-image';
import { StyleSheet, View, type StyleProp } from 'react-native';
import { useEffect, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Stage } from '@/engine/rules';

/** One pose's art: a looping animation and its first frame as a still. */
type PoseArt = {
  /** The looping animation; looks still waiting for theirs fall back to `still`. */
  animated?: number;
  still: number;
  /** Width / height of the picture. */
  aspect: number;
  /** Where the feet are across the picture (0 = left edge), for lining poses up. */
  feet: number;
  /** Drawn this share of the standing height, e.g. when lying down. */
  scale?: number;
};

export type DragonPose = 'idle' | 'walk' | 'stroll' | 'water' | 'sleep';

/** How the dragon looks as it grows: the baby art, then the young art from its first growth. */
export type DragonLook = 'baby' | 'young';

/**
 * The full-body dragon, alive. Each pose is a looping transparent animation made
 * from a generated clip (see scripts/video-cutout.py); its first frame is kept as
 * a still for people who prefer reduced motion.
 */
const ART: Record<DragonLook, Record<DragonPose, PoseArt>> = {
  baby: {
    /** Standing, facing you: breathes, blinks, tilts its head, swishes its tail. */
    idle: {
      animated: require('@/assets/images/dragon/anim/idle.webp'),
      still: require('@/assets/images/dragon/anim/idle.png'),
      aspect: 485 / 600,
      feet: 0.56,
    },
    /** Walking on the spot with a stick and bundle over its shoulder, facing right. */
    walk: {
      animated: require('@/assets/images/dragon/anim/walk.webp'),
      still: require('@/assets/images/dragon/anim/walk.png'),
      aspect: 460 / 600,
      feet: 0.584,
    },
    /** Walking on the spot empty-handed, facing right: for moving around the garden. */
    stroll: {
      animated: require('@/assets/images/dragon/anim/stroll.webp'),
      still: require('@/assets/images/dragon/anim/stroll.png'),
      aspect: 453 / 600,
      feet: 0.418,
    },
    /** Watering with a little can, side view facing right; the water falls ahead of it. */
    water: {
      animated: require('@/assets/images/dragon/anim/water.webp'),
      still: require('@/assets/images/dragon/anim/water.png'),
      aspect: 594 / 600,
      feet: 0.528,
    },
    /** Curled up asleep, breathing slowly; lower and wider than standing. */
    sleep: {
      animated: require('@/assets/images/dragon/anim/sleep.webp'),
      still: require('@/assets/images/dragon/anim/sleep.png'),
      aspect: 603 / 400,
      feet: 0.5,
      scale: 0.62,
    },
  },
  // Grown a little: a snout, a long neck, bigger wings. Stills until the loops are made.
  young: {
    idle: {
      still: require('@/assets/images/dragon/young/idle.png'),
      aspect: 494 / 600,
      feet: 0.476,
    },
    walk: {
      still: require('@/assets/images/dragon/young/walk.png'),
      aspect: 493 / 600,
      feet: 0.621,
    },
    stroll: {
      still: require('@/assets/images/dragon/young/stroll.png'),
      aspect: 557 / 600,
      feet: 0.633,
    },
    water: {
      still: require('@/assets/images/dragon/young/water.png'),
      aspect: 574 / 600,
      feet: 0.473,
    },
    sleep: {
      still: require('@/assets/images/dragon/young/sleep.png'),
      aspect: 575 / 400,
      feet: 0.604,
      scale: 0.55,
    },
  },
};

/** The art for a growth stage: babies look like babies, every later stage uses the young art for now. */
export function lookForStage(stage: Stage): DragonLook {
  return stage === 'baby' ? 'baby' : 'young';
}

/** How tall a pose is drawn for a given standing height (lying poses are lower). */
function poseHeight(pose: DragonPose, height: number, look: DragonLook = 'baby') {
  return height * (ART[look][pose].scale ?? 1);
}

/** Width of a pose at a given standing height. */
export function poseWidth(pose: DragonPose, height: number, look: DragonLook = 'baby') {
  return poseHeight(pose, height, look) * ART[look][pose].aspect;
}

type DragonSpriteProps = {
  pose?: DragonPose;
  /** Height in points; width follows the pose's shape. */
  height: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  /** Mirror it, so a right-facing pose faces left. */
  flip?: boolean;
  /** Keep the animation still while hidden (see `DragonPoses`). */
  playing?: boolean;
  look?: DragonLook;
};

export function DragonSprite({
  pose = 'idle',
  height,
  style,
  accessibilityLabel,
  flip = false,
  playing = true,
  look = 'baby',
}: DragonSpriteProps) {
  const reduceMotion = useReducedMotion();
  const { animated, still } = ART[look][pose];
  const drawn = poseHeight(pose, height, look);

  const image = (
    <Image
      source={reduceMotion || !animated ? still : animated}
      style={[
        { width: poseWidth(pose, height, look), height: drawn },
        flip && { transform: [{ scaleX: -1 }] },
        style,
      ]}
      contentFit="contain"
      autoplay={!reduceMotion && playing}
      // Apple's decoder can blend transparent animated WebP frames wrongly.
      useAppleWebpCodec={false}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    />
  );
  // Art still waiting for its animation gets a little life in code instead.
  if (animated || reduceMotion) return image;
  return (
    <StillLife pose={pose} playing={playing}>
      {image}
    </StillLife>
  );
}

/** Breathing for standing and sleeping stills; a step bob for walking ones. */
function StillLife({
  pose,
  playing,
  children,
}: {
  pose: DragonPose;
  playing: boolean;
  children: ReactNode;
}) {
  const t = useSharedValue(0);
  const walking = pose === 'walk' || pose === 'stroll';
  useEffect(() => {
    if (!playing) return;
    t.set(
      withRepeat(
        withTiming(1, { duration: walking ? 340 : 1800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [t, walking, playing]);
  const style = useAnimatedStyle(() =>
    walking
      ? { transform: [{ translateY: -t.get() * 5 }, { rotate: `${(t.get() - 0.5) * 2}deg` }] }
      : { transform: [{ scaleY: 1 + t.get() * 0.018 }, { scaleX: 1 - t.get() * 0.006 }] },
  );
  return <Animated.View style={[styles.still, style]}>{children}</Animated.View>;
}

type DragonPosesProps = {
  pose: DragonPose;
  /** Poses this spot may switch between; all stay loaded, so switching never flickers. */
  poses: readonly DragonPose[];
  height: number;
  flip?: boolean;
  accessibilityLabel?: string;
  look?: DragonLook;
};

/**
 * Several poses stacked and lined up by the dragon's feet, with only the current
 * one shown. Switching pose or direction swaps instantly: no reload, no blank
 * frame, and the body stays where it is.
 */
export function DragonPoses({
  pose,
  poses,
  height,
  flip = false,
  accessibilityLabel,
  look = 'baby',
}: DragonPosesProps) {
  const width = Math.max(...poses.map((p) => poseWidth(p, height, look)));
  return (
    <View
      style={{ width, height }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}>
      {poses.map((p) => {
        const w = poseWidth(p, height, look);
        // Shift so this pose's feet sit at the middle; mirrored poses shift the other way.
        const feetOffset = (ART[look][p].feet - 0.5) * w * (flip ? -1 : 1);
        const shown = p === pose;
        return (
          <View
            key={p}
            pointerEvents="none"
            style={[
              styles.pose,
              {
                left: (width - w) / 2 - feetOffset,
                width: w,
                height: poseHeight(p, height, look),
                opacity: shown ? 1 : 0,
              },
            ]}>
            <DragonSprite pose={p} height={height} flip={flip} playing={shown} look={look} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  still: {
    transformOrigin: 'bottom',
  },
  // Poses stand on the same ground line.
  pose: {
    position: 'absolute',
    bottom: 0,
  },
});
