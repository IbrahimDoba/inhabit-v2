import { Image, type ImageStyle } from 'expo-image';
import { StyleSheet, View, type StyleProp } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * The full-body dragon, alive. Each pose is a looping transparent animation made
 * from a generated clip (see scripts/video-cutout.py); its first frame is kept as
 * a still for people who prefer reduced motion.
 */
const POSES = {
  /** Standing, facing you: breathes, blinks, tilts its head, swishes its tail. */
  idle: {
    animated: require('@/assets/images/dragon/anim/idle.webp'),
    still: require('@/assets/images/dragon/anim/idle.png'),
    aspect: 485 / 600,
    /** Where the feet are across the picture (0 = left edge), for lining poses up. */
    feet: 0.56,
  },
  /** Walking on the spot with a stick and bundle over its shoulder, facing right. */
  walk: {
    animated: require('@/assets/images/dragon/anim/walk.webp'),
    still: require('@/assets/images/dragon/anim/walk.png'),
    aspect: 460 / 600,
    /** Where the feet are across the picture (0 = left edge), for lining poses up. */
    feet: 0.584,
  },
  /** Walking on the spot empty-handed, facing right: for moving around the garden. */
  stroll: {
    animated: require('@/assets/images/dragon/anim/stroll.webp'),
    still: require('@/assets/images/dragon/anim/stroll.png'),
    aspect: 453 / 600,
    /** Where the feet are across the picture (0 = left edge), for lining poses up. */
    feet: 0.418,
  },
  /** Watering with a little can, side view facing right; the water falls ahead of it. */
  water: {
    animated: require('@/assets/images/dragon/anim/water.webp'),
    still: require('@/assets/images/dragon/anim/water.png'),
    aspect: 594 / 600,
    /** Where the feet are across the picture (0 = left edge), for lining poses up. */
    feet: 0.528,
  },
  /** Curled up asleep, breathing slowly; lower and wider than standing. */
  sleep: {
    animated: require('@/assets/images/dragon/anim/sleep.webp'),
    still: require('@/assets/images/dragon/anim/sleep.png'),
    aspect: 603 / 400,
    /** Where the feet are across the picture (0 = left edge), for lining poses up. */
    feet: 0.5,
    /** Drawn this share of the standing height, since it is lying down. */
    scale: 0.62,
  },
} as const;

export type DragonPose = keyof typeof POSES;

/** How tall a pose is drawn for a given standing height (lying poses are lower). */
function poseHeight(pose: DragonPose, height: number) {
  const entry = POSES[pose];
  return height * ('scale' in entry ? entry.scale : 1);
}

/** Width of a pose at a given standing height. */
export function poseWidth(pose: DragonPose, height: number) {
  return poseHeight(pose, height) * POSES[pose].aspect;
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
};

export function DragonSprite({
  pose = 'idle',
  height,
  style,
  accessibilityLabel,
  flip = false,
  playing = true,
}: DragonSpriteProps) {
  const reduceMotion = useReducedMotion();
  const { animated, still } = POSES[pose];
  const drawn = poseHeight(pose, height);

  return (
    <Image
      source={reduceMotion ? still : animated}
      style={[{ width: poseWidth(pose, height), height: drawn }, flip && { transform: [{ scaleX: -1 }] }, style]}
      contentFit="contain"
      autoplay={!reduceMotion && playing}
      // Apple's decoder can blend transparent animated WebP frames wrongly.
      useAppleWebpCodec={false}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

type DragonPosesProps = {
  pose: DragonPose;
  /** Poses this spot may switch between; all stay loaded, so switching never flickers. */
  poses: readonly DragonPose[];
  height: number;
  flip?: boolean;
  accessibilityLabel?: string;
};

/**
 * Several poses stacked and lined up by the dragon's feet, with only the current
 * one shown. Switching pose or direction swaps instantly: no reload, no blank
 * frame, and the body stays where it is.
 */
export function DragonPoses({ pose, poses, height, flip = false, accessibilityLabel }: DragonPosesProps) {
  const width = Math.max(...poses.map((p) => poseWidth(p, height)));
  return (
    <View
      style={{ width, height }}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}>
      {poses.map((p) => {
        const w = poseWidth(p, height);
        // Shift so this pose's feet sit at the middle; mirrored poses shift the other way.
        const feetOffset = (POSES[p].feet - 0.5) * w * (flip ? -1 : 1);
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
                height: poseHeight(p, height),
                opacity: shown ? 1 : 0,
              },
            ]}>
            <DragonSprite pose={p} height={height} flip={flip} playing={shown} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Poses stand on the same ground line.
  pose: {
    position: 'absolute',
    bottom: 0,
  },
});
