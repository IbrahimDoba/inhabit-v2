import { Image, type ImageSource } from 'expo-image';
import { StyleSheet } from 'react-native';

import { NIGHT_SHADE } from '@/constants/sky';

type NightShadeProps = {
  /** The same picture as the art underneath, so the shade has its exact shape. */
  source: ImageSource | number;
  /** 0 by day, 1 at night. */
  night: number;
  contentPosition?: 'center' | 'bottom';
};

/**
 * Daytime art standing in the night garden gets a dusky copy of itself drawn on
 * top, so it sits in the scene instead of glowing over it. Put it straight after
 * the picture it shades, inside the same box.
 */
export function NightShade({ source, night, contentPosition = 'center' }: NightShadeProps) {
  if (night <= 0.02) return null;
  return (
    <Image
      source={source}
      tintColor={NIGHT_SHADE}
      style={[StyleSheet.absoluteFill, { opacity: 0.36 * night }]}
      contentFit="contain"
      contentPosition={contentPosition}
      pointerEvents="none"
    />
  );
}
