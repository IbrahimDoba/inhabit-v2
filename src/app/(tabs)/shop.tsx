import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ComingSoon } from '@/components/coming-soon';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { PLANT_SPRITES, type PlantSpecies } from '@/constants/plant-sprites';
import { PLANTS, SHOP_PLANTS, STARTER_PLANTS, ownsPlant } from '@/constants/plants';
import { Radii, Spacing } from '@/constants/theme';
import { useCompanion } from '@/hooks/use-companion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function ShopScreen() {
  const theme = useTheme();
  const { dragonName } = useOnboarding();
  const { companion, buySeed } = useCompanion();
  const [message, setMessage] = useState<string | null>(null);
  const diamonds = companion?.diamonds ?? 0;

  const buy = (id: PlantSpecies) => {
    const info = PLANTS[id];
    const events = buySeed(id, info.price);
    const short = events.find((e) => e.type === 'notEnoughDiamonds');
    if (short?.type === 'notEnoughDiamonds') {
      setMessage(`${short.needed} more 💎 for ${info.name}. ${dragonName}'s journeys bring more home.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (events.some((e) => e.type === 'seedBought')) {
      setMessage(`${info.emoji} ${info.name} seeds are yours! Choose it for any habit.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <Screen title="Shop" hint="Spend the diamonds you earn.">
      <View style={[styles.balance, { backgroundColor: theme.primarySoft }]}>
        <ThemedText style={styles.gem}>💎</ThemedText>
        <ThemedText type="subtitle">{diamonds}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          diamonds
        </ThemedText>
      </View>

      <ThemedText type="subtitle" style={styles.heading}>
        Seeds
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        Every plant has a meaning. Pick the one that fits each habit.
      </ThemedText>

      {message ? (
        <Animated.View
          key={message}
          entering={FadeIn.duration(250)}
          style={[styles.message, { backgroundColor: theme.surface, borderColor: theme.border }]}
          accessibilityLiveRegion="polite">
          <ThemedText type="smallBold">{message}</ThemedText>
        </Animated.View>
      ) : null}

      <View style={styles.list}>
        {[...SHOP_PLANTS, ...STARTER_PLANTS].map((id) => {
          const info = PLANTS[id];
          const owned = ownsPlant(id, companion?.ownedSeeds);
          const sprite = PLANT_SPRITES[id].bloom;
          const scale = 64 / sprite.height;
          const affordable = diamonds >= info.price;
          return (
            <View key={id} style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.thumb, { backgroundColor: theme.surfaceMuted }]}>
                <Image
                  source={sprite.source}
                  style={{ width: sprite.width * scale, height: sprite.height * scale }}
                  contentFit="contain"
                />
              </View>
              <View style={styles.itemText}>
                <ThemedText type="smallBold">
                  {info.emoji} {info.name}
                </ThemedText>
                <ThemedText type="small" themeColor="primary">
                  {info.meaning}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {info.about}
                </ThemedText>
              </View>
              {owned ? (
                <View style={[styles.owned, { borderColor: theme.border }]}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    {info.price === 0 ? 'Starter' : 'Owned'}
                  </ThemedText>
                </View>
              ) : (
                <Pressable
                  onPress={() => buy(id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Buy ${info.name} for ${info.price} diamonds`}
                  style={({ pressed }) => [
                    styles.buy,
                    { backgroundColor: affordable ? theme.primary : theme.surfaceMuted },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold" style={{ color: affordable ? theme.onPrimary : theme.textSecondary }}>
                    💎 {info.price}
                  </ThemedText>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      <ComingSoon
        emoji="🎀"
        items={[`Outfits for ${dragonName}.`, 'More decorations for your garden.', 'A few new items every day.']}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  gem: {
    fontSize: 20,
    lineHeight: 26,
  },
  heading: {
    marginTop: Spacing.three,
  },
  message: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.three,
  },
  list: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.two,
  },
  thumb: {
    width: 76,
    height: 84,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.one,
  },
  itemText: {
    flex: 1,
    gap: Spacing.half,
  },
  buy: {
    minWidth: 72,
    minHeight: 40,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  owned: {
    minWidth: 72,
    minHeight: 40,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
