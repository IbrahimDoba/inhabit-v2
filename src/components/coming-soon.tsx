import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ComingSoonProps = {
  emoji: string;
  items: readonly string[];
};

/** A card listing what a tab will hold once it is built. */
export function ComingSoon({ emoji, items }: ComingSoonProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText type="smallBold" themeColor="primary">
        Coming soon
      </ThemedText>
      {items.map((item) => (
        <ThemedText key={item} themeColor="textSecondary" style={styles.center}>
          {item}
        </ThemedText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 48,
    lineHeight: 56,
  },
  center: {
    textAlign: 'center',
  },
});
