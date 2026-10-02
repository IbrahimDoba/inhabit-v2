import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PLANT_SPRITES, type PlantSpecies } from '@/constants/plant-sprites';
import { PLANTS, ownsPlant } from '@/constants/plants';
import { Radii, Spacing } from '@/constants/theme';
import { useCompanion } from '@/hooks/use-companion';
import { useTheme } from '@/hooks/use-theme';

const ORDER: readonly PlantSpecies[] = [
  'sunflower',
  'tulip',
  'bellflower',
  'bluebell',
  'daisy',
  'cactus',
  'rose',
  'cherry',
];

type PlantPickerProps = {
  selected: PlantSpecies | undefined;
  onSelect: (plant: PlantSpecies) => void;
  /** Called before leaving for the shop, e.g. to close a sheet. */
  onGoToShop?: () => void;
};

/** A grid of plant types. Owned ones can be chosen; the rest link to the shop. */
export function PlantPicker({ selected, onSelect, onGoToShop }: PlantPickerProps) {
  const theme = useTheme();
  const { companion } = useCompanion();

  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {ORDER.map((id) => {
        const info = PLANTS[id];
        const owned = ownsPlant(id, companion?.ownedSeeds);
        const isSelected = id === selected;
        const sprite = PLANT_SPRITES[id].bloom;
        const scale = 44 / sprite.height;
        return (
          <Pressable
            key={id}
            onPress={() => {
              if (owned) onSelect(id);
              else {
                onGoToShop?.();
                router.push('/shop');
              }
            }}
            accessibilityRole={owned ? 'radio' : 'button'}
            accessibilityState={owned ? { selected: isSelected } : undefined}
            accessibilityLabel={
              owned
                ? `${info.name}, ${info.meaning}`
                : `${info.name}, ${info.meaning}. ${info.price} diamonds in the shop`
            }
            style={({ pressed }) => [
              styles.cell,
              {
                backgroundColor: isSelected ? theme.primarySoft : theme.surface,
                borderColor: isSelected ? theme.primary : theme.border,
              },
              pressed && styles.pressed,
            ]}>
            <Image
              source={sprite.source}
              style={[
                { width: sprite.width * scale, height: sprite.height * scale },
                !owned && styles.locked,
              ]}
              contentFit="contain"
            />
            <ThemedText type="smallBold" style={styles.center} numberOfLines={1}>
              {info.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.center} numberOfLines={1}>
              {owned ? info.meaning : `💎 ${info.price}`}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
  },
  cell: {
    width: '48.5%',
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.half,
  },
  locked: {
    opacity: 0.4,
  },
  center: {
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
