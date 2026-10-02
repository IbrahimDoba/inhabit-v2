import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonSprite } from '@/components/dragon-sprite';
import { GardenBackdrop } from '@/components/garden-backdrop';
import { GroundShadow } from '@/components/ground-shadow';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <ThemedText type="title" themeColor="ink" style={styles.wordmark}>
            Inhabit
          </ThemedText>
          <ThemedText themeColor="inkSecondary" style={styles.center}>
            A baby dragon is waiting to meet you. Look after your habits and it grows up with you.
          </ThemedText>
        </View>

        <View style={styles.stage}>
          <DragonSprite height={270} accessibilityLabel="A small lavender dragon smiling" />
          <GroundShadow width={120} />
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Find your egg" onPress={() => router.push('/onboarding/egg')} />
          <ThemedText type="small" themeColor="inkSecondary" style={styles.center}>
            No account needed. It all stays on your phone.
          </ThemedText>
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
  wordmark: {
    fontSize: 44,
    lineHeight: 50,
  },
  center: {
    textAlign: 'center',
    maxWidth: 340,
  },
  stage: {
    alignItems: 'center',
    marginTop: Spacing.six,
  },
  footer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingBottom: Spacing.three,
  },
});
