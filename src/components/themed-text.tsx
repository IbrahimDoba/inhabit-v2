import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { splitIcons } from '@/lib/icons';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'small' | 'smallBold' | 'code';
  themeColor?: ThemeColor;
};

/**
 * App text. Emoji inside it are drawn as Twemoji stickers (see `Icon`), so they
 * look the same everywhere: a lone emoji becomes the sticker itself, emoji in a
 * sentence become inline stickers the size of the text.
 */
export function ThemedText({
  style,
  type = 'default',
  themeColor,
  children,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const textStyle = [
    { color: theme[themeColor ?? 'text'] },
    type === 'default' && styles.default,
    type === 'title' && styles.title,
    type === 'subtitle' && styles.subtitle,
    type === 'small' && styles.small,
    type === 'smallBold' && styles.smallBold,
    type === 'code' && styles.code,
    style,
  ];
  const flat: TextStyle = StyleSheet.flatten(textStyle) ?? {};
  const iconSize = Math.round((flat.fontSize ?? 16) * 1.3);

  // A text that is just one emoji: draw the sticker in its place, keeping its layout.
  const only = typeof children === 'string' ? children.trim() : null;
  const lone = only ? splitIcons(only) : [];
  if (lone.length === 1 && 'emoji' in lone[0]) {
    return (
      <Image
        source={lone[0].art.sticker}
        style={[layoutOf(flat), { width: iconSize, height: iconSize }]}
        contentFit="contain"
        accessible={!!rest.accessibilityLabel}
        accessibilityLabel={rest.accessibilityLabel}
      />
    );
  }

  return (
    <Text style={textStyle} {...rest}>
      {withIcons(children, iconSize)}
    </Text>
  );
}

/** Replaces emoji in string children with inline stickers. */
function withIcons(children: ReactNode, size: number): ReactNode {
  const list = Array.isArray(children) ? children : [children];
  if (!list.some((c) => typeof c === 'string' && splitIcons(c).some((p) => 'emoji' in p))) {
    return children;
  }
  return list.flatMap((child, i) =>
    typeof child === 'string'
      ? splitIcons(child).map((part, j) =>
          'emoji' in part ? (
            <Image
              key={`${i}-${j}`}
              source={part.art.sticker}
              style={[{ width: size, height: size }, INLINE]}
              contentFit="contain"
            />
          ) : (
            part.text
          ),
        )
      : [child],
  );
}

/** On the web a picture inside text is a block by default; keep it in the line, centred. */
const INLINE =
  Platform.OS === 'web' ? ({ display: 'inline-flex', verticalAlign: 'middle' } as object) : null;

const TEXT_ONLY = new Set([
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'fontVariant',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textAlignVertical',
  'textDecorationLine',
  'textDecorationColor',
  'textDecorationStyle',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'includeFontPadding',
  'writingDirection',
  'verticalAlign',
  'userSelect',
]);

/** The parts of a text style that still matter for a picture: position, margins, transforms. */
function layoutOf(style: TextStyle) {
  return Object.fromEntries(Object.entries(style).filter(([key]) => !TEXT_ONLY.has(key)));
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  small: {
    fontFamily: Fonts.bodyLight,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    lineHeight: 20,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
