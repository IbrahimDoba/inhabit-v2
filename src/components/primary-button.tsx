import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PrimaryButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** `onMoment` is a white button for the full-bleed celebration screens. */
  variant?: 'default' | 'onMoment';
};

export function PrimaryButton({ label, disabled, variant = 'default', ...rest }: PrimaryButtonProps) {
  const theme = useTheme();
  const onMoment = variant === 'onMoment';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: onMoment ? theme.onMoment : theme.primary },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}>
      <ThemedText style={[styles.label, { color: onMoment ? theme.momentDark : theme.onPrimary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 24,
  },
});
