import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GardenBackdrop } from '@/components/garden-backdrop';
import { GroundShadow } from '@/components/ground-shadow';
import { IdleMotion } from '@/components/idle-motion';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Eggs, getEgg } from '@/constants/eggs';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function EggScreen() {
  const theme = useTheme();
  const { eggId, setEggId } = useOnboarding();
  const selected = getEgg(eggId);

  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <ThemedText type="title" themeColor="ink">
            Choose your egg
          </ThemedText>
          <ThemedText themeColor="inkSecondary" style={styles.center}>
            Every egg holds a baby dragon. Pick the one that feels like yours.
          </ThemedText>
        </View>

        <View style={styles.stage}>
          {/* Keyed so the wobble restarts on the new egg. */}
          <IdleMotion key={selected.id} kind="wobble">
            <Image
              source={selected.image}
              style={styles.bigEgg}
              contentFit="contain"
              transition={150}
              accessibilityLabel={`${selected.label} egg`}
            />
          </IdleMotion>
          <GroundShadow width={96} />
        </View>

        <View style={styles.footer}>
          <View style={[styles.tray, { backgroundColor: theme.artCard }]}>
            <ThemedText type="smallBold" themeColor="ink">
              {selected.label} egg
            </ThemedText>
            <View style={styles.row} accessibilityRole="radiogroup">
              {Eggs.map((egg) => {
                const isSelected = egg.id === eggId;
                return (
                  <Pressable
                    key={egg.id}
                    onPress={() => setEggId(egg.id)}
                    accessibilityRole="radio"
                    accessibilityLabel={`${egg.label} egg`}
                    accessibilityState={{ selected: isSelected }}
                    hitSlop={4}
                    style={[
                      styles.option,
                      { borderColor: isSelected ? theme.primary : 'transparent' },
                    ]}>
                    <Image source={egg.image} style={styles.smallEgg} contentFit="contain" />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <PrimaryButton label="Hatch this egg" onPress={() => router.push('/onboarding/hatch')} />
        </View>
      </SafeAreaView>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.five,
  },
  center: {
    textAlign: 'center',
    maxWidth: 320,
  },
  stage: {
    alignItems: 'center',
    marginTop: Spacing.six,
  },
  bigEgg: {
    width: 150,
    height: 200,
  },
  footer: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  tray: {
    borderRadius: Radii.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  option: {
    width: 48,
    height: 60,
    borderRadius: Radii.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallEgg: {
    width: 34,
    height: 46,
  },
});
