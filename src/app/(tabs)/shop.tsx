import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast, useToasts } from '@/components/home/toast';
import { ComingSoon } from '@/components/coming-soon';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { DECOR } from '@/constants/decor';
import { isPlusItem } from '@/constants/plus';
import { PLANT_SPRITES } from '@/constants/plant-sprites';
import { PLANTS, SHOP_PLANTS, STARTER_PLANTS, ownsPlant } from '@/constants/plants';
import { ROOM_ART } from '@/constants/room-art';
import { Radii, Spacing } from '@/constants/theme';
import type { CompanionEvent } from '@/engine/companion';
import { useCompanion } from '@/hooks/use-companion';
import { useOnboarding } from '@/hooks/use-onboarding';
import { usePlus } from '@/hooks/use-plus';
import { useTheme } from '@/hooks/use-theme';
import { ROOM_ITEMS, ownsRoomItem } from '@/lib/room';

type ShopItem = {
  key: string;
  title: string;
  /** A short line in the accent colour, such as a plant's meaning. */
  accent?: string;
  about: string;
  price: number;
  owned: boolean;
  /** What the pill says once it is owned. */
  ownedLabel: string;
  thumb: ReactNode;
  onBuy: () => void;
  /** Only DragonDen Plus members can buy it. */
  plus?: boolean;
};

/** Room for the floating tab bar under the toast. */
const TAB_BAR_CLEARANCE = Platform.OS === 'web' ? 0 : 64;

export default function ShopScreen() {
  const theme = useTheme();
  const { dragonName } = useOnboarding();
  const { companion, buySeed, buyItem } = useCompanion();
  const toasts = useToasts();
  const { isPlus } = usePlus();
  const insets = useSafeAreaInsets();
  const diamonds = companion?.diamonds ?? 0;

  /** Runs a purchase and says what happened. */
  const purchase = (
    events: CompanionEvent[],
    name: string,
    bought: { title: string; subtitle: string },
  ) => {
    const short = events.find((e) => e.type === 'notEnoughDiamonds');
    if (short?.type === 'notEnoughDiamonds') {
      toasts.show({
        title: `${short.needed} more 💎 for ${name}`,
        subtitle: `${dragonName}'s journeys bring more home.`,
        expression: 'neutral',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (events.some((e) => e.type === 'seedBought' || e.type === 'itemBought')) {
      toasts.show({ title: bought.title, subtitle: bought.subtitle });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const seeds: ShopItem[] = [...SHOP_PLANTS, ...STARTER_PLANTS].map((id) => {
    const info = PLANTS[id];
    const sprite = PLANT_SPRITES[id].bloom;
    const scale = 64 / sprite.height;
    return {
      key: id,
      plus: isPlusItem(id),
      title: `${info.emoji} ${info.name}`,
      accent: info.meaning,
      about: info.about,
      price: info.price,
      owned: ownsPlant(id, companion?.ownedSeeds),
      ownedLabel: info.price === 0 ? 'Starter' : 'Owned',
      thumb: (
        <Image
          source={sprite.source}
          style={{ width: sprite.width * scale, height: sprite.height * scale }}
          contentFit="contain"
        />
      ),
      onBuy: () =>
        purchase(
          buySeed(id, info.price),
          info.name,
          { title: `${info.emoji} ${info.name} seeds are yours!`, subtitle: 'Choose it for any habit.' },
        ),
    };
  });

  const decor: ShopItem[] = DECOR.map((item) => ({
    key: item.id,
    plus: isPlusItem(item.id),
    title: item.name,
    about: item.about,
    price: item.price,
    owned: (companion?.ownedItems ?? []).includes(item.id),
    ownedLabel: 'In garden',
    thumb: <Image source={item.source} style={styles.art} contentFit="contain" />,
    onBuy: () =>
      purchase(buyItem(item.id, item.price), item.name, {
        title: `${item.name} is yours!`,
        subtitle: 'It is in your garden now.',
      }),
  }));

  const furniture: ShopItem[] = ROOM_ITEMS.filter((item) => item.price > 0).map((item) => ({
    key: item.id,
    plus: isPlusItem(item.id),
    title: item.name,
    about: item.detail,
    price: item.price,
    owned: ownsRoomItem(item.id, companion?.ownedItems),
    ownedLabel: 'Owned',
    thumb: <Image source={ROOM_ART[item.id].source} style={styles.art} contentFit="contain" />,
    onBuy: () =>
      purchase(buyItem(item.id, item.price), item.name, {
        title: `${item.name} is yours!`,
        subtitle: `Place it in ${dragonName}'s den.`,
      }),
  }));

  const sections = [
    {
      title: 'Seeds',
      hint: 'Every plant has a meaning. Pick the one that fits each habit.',
      items: seeds,
    },
    {
      title: 'Garden decorations',
      hint: 'Each one has its own spot in the garden, and stays for good.',
      items: decor,
    },
    {
      title: `For ${dragonName}'s den`,
      hint: 'Furniture to place in the den, from the house button on Home.',
      items: furniture,
    },
  ];

  return (
    <Screen
      title="Shop"
      hint="Spend the diamonds you earn."
      overlay={
        <View style={[styles.toastLayer, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]} pointerEvents="none">
          <Toast message={toasts.current} />
        </View>
      }>
      <View style={[styles.balance, { backgroundColor: theme.primarySoft }]}>
        <ThemedText style={styles.gem}>💎</ThemedText>
        <ThemedText type="subtitle">{diamonds}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          diamonds
        </ThemedText>
      </View>

      {isPlus ? null : (
        <Pressable
          onPress={() => router.push('/plus')}
          accessibilityRole="button"
          testID="shop-plus"
          style={({ pressed }) => [
            styles.plusCard,
            { backgroundColor: theme.surface, borderColor: theme.primary },
            pressed && styles.pressed,
          ]}>
          <View style={styles.itemText}>
            <ThemedText type="smallBold">💜 DragonDen Plus</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              50% more diamonds from every journey, and the Plus collection.
            </ThemedText>
          </View>
          <ThemedText type="smallBold" themeColor="primary">
            See ›
          </ThemedText>
        </Pressable>
      )}

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <ThemedText type="subtitle" style={styles.heading}>
            {section.title}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{section.hint}</ThemedText>
          <View style={styles.list}>
            {section.items.map((item) => {
              const affordable = diamonds >= item.price;
              const locked = !!item.plus && !isPlus;
              return (
                <View
                  key={item.key}
                  style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.thumb, { backgroundColor: theme.surfaceMuted }]}>{item.thumb}</View>
                  <View style={styles.itemText}>
                    <ThemedText type="smallBold">{item.title}</ThemedText>
                    {item.plus ? (
                      <ThemedText type="small" themeColor="primary">
                        💜 Plus collection
                      </ThemedText>
                    ) : null}
                    {item.accent ? (
                      <ThemedText type="small" themeColor="primary">
                        {item.accent}
                      </ThemedText>
                    ) : null}
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.about}
                    </ThemedText>
                  </View>
                  {item.owned ? (
                    <View style={[styles.owned, { borderColor: theme.border }]}>
                      <ThemedText type="smallBold" themeColor="textSecondary">
                        {item.ownedLabel}
                      </ThemedText>
                    </View>
                  ) : (
                    <Pressable
                      onPress={locked ? () => router.push('/plus') : item.onBuy}
                      accessibilityRole="button"
                      accessibilityLabel={
                        locked
                          ? `${item.title} is part of DragonDen Plus`
                          : `Buy ${item.title} for ${item.price} diamonds`
                      }
                      testID={`buy-${item.key}`}
                      style={({ pressed }) => [
                        styles.buy,
                        { backgroundColor: locked ? theme.primarySoft : affordable ? theme.primary : theme.surfaceMuted },
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={{ color: locked ? theme.primary : affordable ? theme.onPrimary : theme.textSecondary }}>
                        {locked ? '💜 Plus' : `💎 ${item.price}`}
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <ComingSoon emoji="🎀" items={[`Outfits for ${dragonName}.`, 'A few new items every day.']} />
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
  section: {
    gap: Spacing.two,
  },
  heading: {
    marginTop: Spacing.three,
  },
  art: {
    width: 64,
    height: 64,
  },
  plusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 2,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  toastLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
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
    overflow: 'hidden',
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
    transform: [{ scale: 0.97 }],
  },
});
