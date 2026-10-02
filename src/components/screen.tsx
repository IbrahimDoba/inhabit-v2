import { type ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing, TabBarTopInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  title: string;
  hint?: string;
  children?: ReactNode;
};

/** Plain tab screen: a title, one line of secondary text, then scrolling content. */
export function Screen({ title, hint, children }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">{title}</ThemedText>
        {hint ? <ThemedText themeColor="textSecondary">{hint}</ThemedText> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three + TabBarTopInset,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
});
