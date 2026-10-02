import { Image, type ImageStyle } from 'expo-image';
import { type StyleProp } from 'react-native';
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
  },
  /** Walking on the spot with a stick and bundle over its shoulder, facing right. */
  walk: {
    animated: require('@/assets/images/dragon/anim/walk.webp'),
    still: require('@/assets/images/dragon/anim/walk.png'),
    aspect: 460 / 600,
  },
  /** Walking on the spot empty-handed, facing right: for moving around the garden. */
  stroll: {
    animated: require('@/assets/images/dragon/anim/stroll.webp'),
    still: require('@/assets/images/dragon/anim/stroll.png'),
    aspect: 453 / 600,
  },
  /** Watering with a little can, side view facing right; the water falls ahead of it. */
  water: {
    animated: require('@/assets/images/dragon/anim/water.webp'),
    still: require('@/assets/images/dragon/anim/water.png'),
    aspect: 594 / 600,
  },
} as const;

export type DragonPose = keyof typeof POSES;

type DragonSpriteProps = {
  pose?: DragonPose;
  /** Height in points; width follows the pose's shape. */
  height: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  /** Mirror it, so a right-facing pose faces left. */
  flip?: boolean;
};

export function DragonSprite({
  pose = 'idle',
  height,
  style,
  accessibilityLabel,
  flip = false,
}: DragonSpriteProps) {
  const reduceMotion = useReducedMotion();
  const { animated, still, aspect } = POSES[pose];

  return (
    <Image
      source={reduceMotion ? still : animated}
      style={[{ width: height * aspect, height }, flip && { transform: [{ scaleX: -1 }] }, style]}
      contentFit="contain"
      autoplay={!reduceMotion}
      // Apple's decoder can blend transparent animated WebP frames wrongly.
      useAppleWebpCodec={false}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
