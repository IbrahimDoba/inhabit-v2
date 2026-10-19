import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonPortrait } from '@/components/dragon-portrait';
import { GardenBackdrop } from '@/components/garden-backdrop';
import { PrimaryButton } from '@/components/primary-button';
import { IconPebble } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Traits } from '@/constants/dragon';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function TraitScreen() {
  const theme = useTheme();
  const { dragonName, traitId, setTraitId } = useOnboarding();
  const selected = Traits.find((trait) => trait.id === traitId);

  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.root} bounces={false}>
          <View style={styles.header}>
            <ThemedText type="title" themeColor="ink" style={styles.center}>
              What is {dragonName} like?
            </ThemedText>
            <ThemedText themeColor="inkSecondary" style={styles.center}>
              Pick the trait that fits best.
            </ThemedText>
          </View>

          <DragonPortrait
            expression={selected?.expression ?? 'neutral'}
            size={150}
            accessibilityLabel={
              selected ? `${dragonName} looking ${selected.label.toLowerCase()}` : dragonName
            }
          />

          <View style={styles.list} accessibilityRole="radiogroup">
            {Traits.map((trait) => {
              const isSelected = trait.id === traitId;
              return (
                <Pressable
                  key={trait.id}
                  onPress={() => setTraitId(trait.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${trait.label}. ${trait.description}`}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: isSelected ? theme.primarySoft : theme.artCard,
                      borderColor: isSelected ? theme.primary : 'transparent',
                    },
                    pressed && styles.pressed,
                  ]}>
                  <IconPebble emoji={trait.emoji} size={44} />
                  <View style={styles.optionText}>
                    <ThemedText type="smallBold" themeColor="ink">
                      {trait.label}
                    </ThemedText>
                    <ThemedText type="small" themeColor="inkSecondary">
                      {trait.description}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>

        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            label={selected ? `${dragonName} is ${selected.label.toLowerCase()}` : 'Pick a trait'}
            onPress={() => router.push('/onboarding/quiz')}
            disabled={!selected}
          />
        </View>
      </SafeAreaView>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
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
  list: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 2,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 56,
  },
  optionText: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
