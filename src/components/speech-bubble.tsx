import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** What the dragon says. The tail points up at the dragon above it. */
export function SpeechBubble({ text }: { text: string }) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.tail, { borderBottomColor: theme.bubble }]} />
      <View style={[styles.bubble, { backgroundColor: theme.bubble }]}>
        <ThemedText type="subtitle" themeColor="ink" style={styles.text}>
          {text}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  bubble: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 26,
  },
});
