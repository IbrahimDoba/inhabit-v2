import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MomentPageProps = {
  /** Background colour, or an animated style that sets one. Defaults to `momentBright`. */
  background?: string | AnimatedStyle<ViewStyle>;
  footer?: ReactNode;
  children: ReactNode;
};

/** Full-bleed colour screen for celebration moments (Day 1, streaks). */
export function MomentPage({ background, footer, children }: MomentPageProps) {
  const theme = useTheme();
  const bg =
    typeof background === 'string' || background === undefined
      ? { backgroundColor: background ?? theme.momentBright }
      : background;

  return (
    <Animated.View style={[styles.root, bg]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  footer: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    minHeight: 56 + Spacing.three + Spacing.two,
  },
});
