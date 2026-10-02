import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GardenBackdrop } from '@/components/garden-backdrop';
import { HatchScene } from '@/components/hatch-scene';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { getEgg } from '@/constants/eggs';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';

const COPY = [
  { title: 'Your egg feels warm', hint: 'Tap the egg to help it hatch.' },
  { title: 'Something moved…', hint: 'Keep tapping.' },
  { title: 'Almost there!', hint: 'One more tap.' },
  { title: 'Here it comes!', hint: ' ' },
];
const HATCHED = { title: 'Hello, little one!', hint: 'Your baby dragon has hatched.' };

export default function HatchScreen() {
  const { eggId } = useOnboarding();
  const egg = getEgg(eggId);
  const [taps, setTaps] = useState(0);
  const [hatched, setHatched] = useState(false);
  const onHatched = useCallback(() => setHatched(true), []);

  const copy = hatched ? HATCHED : COPY[taps];

  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.root}>
        <View style={styles.header} accessibilityLiveRegion="polite">
          <Animated.View key={copy.title} entering={FadeIn.duration(200)} style={styles.header}>
            <ThemedText type="title" themeColor="ink" style={styles.center}>
              {copy.title}
            </ThemedText>
            <ThemedText themeColor="inkSecondary" style={styles.center}>
              {copy.hint}
            </ThemedText>
          </Animated.View>
        </View>

        <View style={styles.stage}>
          <HatchScene
            egg={egg}
            taps={taps}
            onTap={() => setTaps((n) => n + 1)}
            onHatched={onHatched}
          />
        </View>

        <View style={styles.footer}>
          {hatched ? (
            <Animated.View entering={FadeIn.duration(300)}>
              {/* Replace, so going back never replays the hatch. */}
              <PrimaryButton
                label="Meet your dragon"
                onPress={() => router.replace('/onboarding/name')}
              />
            </Animated.View>
          ) : (
            <View style={styles.buttonSpace} />
          )}
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
    maxWidth: 340,
  },
  stage: {
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  footer: {
    paddingBottom: Spacing.three,
  },
  buttonSpace: {
    height: 56,
  },
});
