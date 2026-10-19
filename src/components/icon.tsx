import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconTileColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { iconArt } from '@/lib/icons';

type IconProps = {
  emoji: string;
  /** Width and height in points, outline included. */
  size: number;
  /** No white sticker outline: for things drawn into a scene. */
  plain?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * An emoji drawn as a Twemoji sticker: the bundled picture with a white outline,
 * the same on every phone. Emoji the app has no art for fall back to the system emoji.
 */
export function Icon({ emoji, size, plain = false, style }: IconProps) {
  const art = iconArt(emoji);
  if (!art) {
    return (
      <View style={[{ width: size, height: size }, styles.center, style]}>
        <ThemedText style={{ fontSize: size * 0.72, lineHeight: size }}>{emoji}</ThemedText>
      </View>
    );
  }
  return (
    <Image
      source={plain && art.plain ? art.plain : art.sticker}
      style={[{ width: size, height: size }, style as object]}
      contentFit="contain"
    />
  );
}

/** A sticker on a soft grey pebble, like a habit's icon in its row. */
export function IconPebble({
  emoji,
  size = 48,
  selected = false,
  children,
}: {
  emoji: string;
  size?: number;
  selected?: boolean;
  children?: ReactNode;
}) {
  const theme = useTheme();
  const r = size / 2;
  return (
    <View
      style={[
        styles.center,
        {
          width: size,
          height: size,
          backgroundColor: selected ? theme.primarySoft : theme.pebble,
          // Uneven corners make a hand-shaped pebble rather than a perfect circle.
          borderTopLeftRadius: r * 1.05,
          borderTopRightRadius: r * 0.82,
          borderBottomRightRadius: r * 1.0,
          borderBottomLeftRadius: r * 0.78,
        },
      ]}>
      <Icon emoji={emoji} size={size * 0.74} />
      {children}
    </View>
  );
}

/** A sticker on a bright rounded tile; `tone` picks one of the tile colours. */
export function IconTile({ emoji, size = 52, tone = 0 }: { emoji: string; size?: number; tone?: number }) {
  return (
    <View
      style={[
        styles.center,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: IconTileColors[Math.abs(tone) % IconTileColors.length],
        },
      ]}>
      <Icon emoji={emoji} size={size * 0.74} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
