/**
 * Inhabit design tokens, matching the dragon: lavender, mint, warm gold and plum.
 * `ink`, `inkSecondary`, `artCard`, `groundShadow`, `crack`, `burst`, `bubble` and the `moment*` colours are for
 * drawing on the daytime artwork or full-bleed celebration screens; those screens pin the
 * light scheme.
 * Use these through `useTheme()`, `ThemedText` and `ThemedView`, never inline hex values.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F7F5FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EEEAF6',
    border: '#E3DEEF',
    text: '#2A2140',
    textSecondary: '#6F678A',
    primary: '#6C4FE0',
    primarySoft: '#E4DDFA',
    danger: '#C0392B',
    onPrimary: '#FFFFFF',
    ink: '#2A2140',
    inkSecondary: '#5B5373',
    artCard: 'rgba(255, 255, 255, 0.78)',
    groundShadow: 'rgba(59, 42, 74, 0.1)',
    crack: 'rgba(59, 42, 74, 0.55)',
    burst: '#FFF6DD',
    bubble: '#FFFFFF',
    momentDark: '#3B2A4A',
    momentBright: '#6C4FE0',
    onMoment: '#FFFFFF',
    onMomentMuted: 'rgba(255, 255, 255, 0.72)',
    momentCard: 'rgba(255, 255, 255, 0.14)',
    confettiPink: '#F4A4C0',
    confettiBlue: '#8ED1FC',
    mint: '#A9E5C1',
    mintDeep: '#2F8F63',
    gold: '#F2C14E',
    plum: '#3B2A4A',
    pebble: '#EFEDF4',
  },
  dark: {
    background: '#16121F',
    surface: '#201A2C',
    surfaceMuted: '#2A2338',
    border: '#332B45',
    text: '#F3EFFA',
    textSecondary: '#A99FC2',
    primary: '#B8A9E8',
    primarySoft: '#34285A',
    danger: '#FF8A80',
    onPrimary: '#2A2140',
    ink: '#2A2140',
    inkSecondary: '#5B5373',
    artCard: 'rgba(255, 255, 255, 0.78)',
    groundShadow: 'rgba(59, 42, 74, 0.1)',
    crack: 'rgba(59, 42, 74, 0.55)',
    burst: '#FFF6DD',
    bubble: '#FFFFFF',
    momentDark: '#3B2A4A',
    momentBright: '#6C4FE0',
    onMoment: '#FFFFFF',
    onMomentMuted: 'rgba(255, 255, 255, 0.72)',
    momentCard: 'rgba(255, 255, 255, 0.14)',
    confettiPink: '#F4A4C0',
    confettiBlue: '#8ED1FC',
    mint: '#A9E5C1',
    mintDeep: '#6CCB9A',
    gold: '#F2C14E',
    plum: '#D9CFEA',
    pebble: '#2D2640',
  },
} as const;

/** Bright tiles behind sticker icons (quests, shop), picked in turn so neighbours differ. */
export const IconTileColors = ['#9B7BEA', '#F6C24E', '#6DBB63', '#45BDEB', '#F28BA8', '#4FC9B4'] as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Type: Fredoka (round, friendly) for titles and headings, Nunito (rounded, very
 * readable) for everything else. Each weight is its own family name, loaded in
 * the root layout, so set `fontFamily` and never `fontWeight` with these.
 */
export const Fonts = {
  /** Big titles. */
  display: 'Fredoka_700Bold',
  /** Subtitles, buttons, big inputs, numbers that matter. */
  heading: 'Fredoka_600SemiBold',
  /** Body text. */
  body: 'Nunito_600SemiBold',
  /** Secondary and small text. */
  bodyLight: 'Nunito_500Medium',
  /** Labels and emphasis inside body text. */
  bodyBold: 'Nunito_800ExtraBold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const MaxContentWidth = 800;

/** On web the native tabs float over the top of each tab screen; leave room for them. */
export const TabBarTopInset = Platform.OS === 'web' ? 64 : 0;
