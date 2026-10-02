import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import type { PropSprite } from '@/constants/prop-sprites';
import { LANTERN_GLOW } from '@/constants/sky';

type GardenGiftProps = {
  sprite: PropSprite;
  scale: number;
  /** 1 when first placed; each later gift of the same kind upgrades it. */
  level: number;
  /** Just brought home: pop in with a bounce. */
  isNew: boolean;
  /** 0 by day, 1 at night: the lantern lights up. */
  glow?: number;
};

/** A journey gift placed in the garden. Upgrades make it a little bigger and sparkly. */
export function GardenGift({ sprite, scale, level, isNew, glow = 0 }: GardenGiftProps) {
  const size = scale * (1 + (level - 1) * 0.12);
  const width = sprite.width * size;
  const height = sprite.height * size;

  return (
    <Animated.View entering={isNew ? ZoomIn.springify().damping(9) : FadeIn.duration(500)}>
      {glow > 0 ? (
        <View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: width * 1.6,
              height: width * 1.6,
              borderRadius: width,
              left: width * 0.35 - width * 0.3,
              top: height * 0.15 - width * 0.3,
              backgroundColor: LANTERN_GLOW,
              opacity: 0.35 * glow,
              boxShadow: `0 0 ${width * 0.6}px ${width * 0.3}px ${LANTERN_GLOW}`,
            },
          ]}
        />
      ) : null}
      <Image source={sprite.source} style={{ width, height }} contentFit="contain" />
      {level > 1 ? (
        <View style={styles.badge} pointerEvents="none">
          <ThemedText style={styles.sparkle}>{level > 2 ? '✨✨' : '✨'}</ThemedText>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -6,
  },
  sparkle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
