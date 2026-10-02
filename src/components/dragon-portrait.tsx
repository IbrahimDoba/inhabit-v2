import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IdleMotion } from '@/components/idle-motion';
import { Expressions, type Expression } from '@/constants/dragon';
import { useTheme } from '@/hooks/use-theme';

type DragonPortraitProps = {
  expression: Expression;
  size?: number;
  accessibilityLabel?: string;
};

/** The dragon's head and shoulders in a round frame, which hides the flat cut at the bottom. */
export function DragonPortrait({ expression, size = 180, accessibilityLabel }: DragonPortraitProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.artCard },
      ]}>
      <IdleMotion kind="breathe" style={styles.fill}>
        <Image
          source={Expressions[expression]}
          style={[styles.image, { width: size * 0.86, height: size * 0.96 }]}
          contentFit="contain"
          contentPosition="bottom"
          transition={200}
          accessibilityLabel={accessibilityLabel}
        />
      </IdleMotion>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignSelf: 'center',
  },
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    marginBottom: -4,
  },
});
