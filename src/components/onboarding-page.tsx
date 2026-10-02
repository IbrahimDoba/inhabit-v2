import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GardenBackdrop } from '@/components/garden-backdrop';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type OnboardingPageProps = {
  title: string;
  hint?: string;
  /** Pinned below the scrolling content, usually the primary button. */
  footer: ReactNode;
  children: ReactNode;
};

/** Garden backdrop, a title block, scrolling content and a pinned footer. */
export function OnboardingPage({ title, hint, footer, children }: OnboardingPageProps) {
  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <View style={styles.header}>
            <ThemedText type="title" themeColor="ink" style={styles.center}>
              {title}
            </ThemedText>
            {hint ? (
              <ThemedText themeColor="inkSecondary" style={styles.center}>
                {hint}
              </ThemedText>
            ) : null}
          </View>
          {children}
        </ScrollView>
        <View style={styles.footer}>{footer}</View>
      </SafeAreaView>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.four,
  },
  center: {
    textAlign: 'center',
    maxWidth: 340,
  },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
});
