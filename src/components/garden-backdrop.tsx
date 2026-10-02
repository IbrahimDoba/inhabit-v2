import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

const gardenDay = require('@/assets/images/garden-day.jpg');

/** Full-bleed daytime garden behind a screen. Children render on top. */
export function GardenBackdrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <Image
        source={gardenDay}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="bottom"
        accessible={false}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
