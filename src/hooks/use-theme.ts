/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { createContext, useContext } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Pins a subtree to one scheme. Screens drawn on the daytime artwork use light
 * colours even when the phone is in dark mode, or dark text lands on dark fills.
 */
export const ColorSchemeOverride = createContext<'light' | 'dark' | null>(null);

export function useTheme() {
  const override = useContext(ColorSchemeOverride);
  const scheme = useColorScheme();
  const theme = override ?? (scheme === 'dark' ? 'dark' : 'light');

  return Colors[theme];
}
