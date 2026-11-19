import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { DragonPoses } from '@/components/dragon-sprite';
import { ThemedText } from '@/components/themed-text';
import { gentleIn } from '@/constants/motion';
import { ROOM_ART, ROOM_SLOTS } from '@/constants/room-art';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useCompanion } from '@/hooks/use-companion';
import { useDragonLook } from '@/hooks/use-dragon-look';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useSky } from '@/hooks/use-sky';
import { useTheme } from '@/hooks/use-theme';
import { useStatusBarOverride } from '@/hooks/use-status-bar';
import {
  ROOM_ITEMS,
  ownsRoomItem,
  placedIn,
  roomLayout,
  togglePlaced,
  type RoomItemId,
  type RoomLayout,
} from '@/lib/room';
import { loadSaved, save } from '@/lib/storage';

const ROOM = {
  day: require('@/assets/images/house/room-day.webp'),
  night: require('@/assets/images/house/room-night.webp'),
};
const KEY = 'inhabit.room';

/** The dragon's den from ART-PLAN §6. Furniture is separate, saved layers. */
export default function HouseScreen() {
  const theme = useTheme();
  const { dragonName } = useOnboarding();
  const { companion } = useCompanion();
  const look = useDragonLook();
  const { sky } = useSky();
  const reduced = useReducedMotion();
  const window = useWindowDimensions();
  const width = Math.min(window.width - Spacing.three * 2, 600);
  const height = width * 1.08;
  const night = sky.night > 0.55;
  const away = !!companion?.journey;
  const { setOverride } = useStatusBarOverride();
  useFocusEffect(useCallback(() => {
    setOverride(night ? 'light' : 'dark');
    return () => setOverride(null);
  }, [night, setOverride]));
  const [saved, setLayout] = useState<RoomLayout>(() => roomLayout(loadSaved(KEY, 1)));
  useEffect(() => save(KEY, 1, { placed: saved }), [saved]);
  // Only pieces this dragon owns stand in the room, whatever an old save says.
  const layout = saved.filter((id) => ownsRoomItem(id, companion?.ownedItems));
  const sleeping = night && !away;
  const bedSlot = ROOM_SLOTS.find((s) => s.slot === 'bed')!;
  const inBed = sleeping && placedIn(layout, 'bed') !== null;
  const dragonHeight = Math.min(220, width * 0.59);
  const owned = ROOM_ITEMS.filter((item) => ownsRoomItem(item.id, companion?.ownedItems));
  const toggle = (id: RoomItemId) => setLayout((current) => togglePlaced(current, id));

  const piece = (slot: (typeof ROOM_SLOTS)[number]) => {
    const id = placedIn(layout, slot.slot);
    if (!id) return null;
    const art = ROOM_ART[id];
    return (
      <Animated.View
        key={id}
        entering={reduced ? undefined : gentleIn()}
        pointerEvents="none"
        style={[
          styles.layer,
          {
            left: width * slot.left,
            bottom: height * slot.bottom,
            width: width * slot.width,
            height: height * slot.height,
          },
        ]}>
        <Image
          source={night && art.night ? art.night : art.source}
          style={styles.fill}
          contentFit="contain"
          contentPosition="bottom"
          transition={reduced ? 0 : 300}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} accessibilityRole="button" accessibilityLabel="Back to garden" hitSlop={12}>
          <ThemedText themeColor="primary">‹ Garden</ThemedText>
        </Pressable>
        <ThemedText type="subtitle" numberOfLines={1} style={styles.title}>{dragonName}&apos;s den</ThemedText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.scene, { width, height }]} accessibilityLabel={`${dragonName}'s cozy room, ${night ? 'night' : 'day'}`}>
          <Image source={ROOM.day} style={StyleSheet.absoluteFill} contentFit="cover" />
          <Image source={ROOM.night} style={[StyleSheet.absoluteFill, { opacity: sky.night }]} contentFit="cover" />
          {ROOM_SLOTS.filter((s) => !s.front).map(piece)}
          {!away ? (
            <View style={[styles.dragon, { bottom: inBed ? height * (bedSlot.bottom + bedSlot.height * 0.34) : height * 0.08 }]} pointerEvents="none">
              <DragonPoses pose={sleeping ? 'sleep' : 'idle'} poses={['idle', 'sleep']} look={look} height={dragonHeight} accessibilityLabel={`${dragonName}, ${sleeping ? 'sleeping peacefully' : 'at home'}`} />
            </View>
          ) : null}
          {ROOM_SLOTS.filter((s) => s.front).map(piece)}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {away ? `${dragonName} is exploring. A cozy room will be waiting.` : sleeping ? `${dragonName} is resting. There is nothing you need to do.` : 'A little place to make your own.'}
        </ThemedText>
        <ThemedText type="subtitle">Furniture</ThemedText>
        {owned.map((item) => {
          const placed = layout.includes(item.id);
          return (
            <Pressable key={item.id} onPress={() => toggle(item.id)} accessibilityRole="switch" accessibilityState={{ checked: placed }} accessibilityLabel={item.name} testID={`room-${item.id}`} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Image source={ROOM_ART[item.id].source} style={styles.thumb} contentFit="contain" />
              <View style={styles.label}>
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">{item.detail}</ThemedText>
              </View>
              <ThemedText type="smallBold" themeColor={placed ? 'textSecondary' : 'primary'}>{placed ? 'Placed' : 'Place'}</ThemedText>
            </Pressable>
          );
        })}
        {owned.length < ROOM_ITEMS.length ? (
          <Pressable onPress={() => router.dismissTo('/shop')} accessibilityRole="link" testID="room-shop" style={[styles.more, { borderColor: theme.border }]}>
            <ThemedText type="smallBold" themeColor="primary">More furniture in the shop ›</ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.three },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.six },
  scene: { alignSelf: 'center', borderRadius: Radii.lg, overflow: 'hidden' },
  layer: { position: 'absolute' },
  fill: { width: '100%', height: '100%' },
  dragon: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  title: { flexShrink: 1, marginLeft: Spacing.three },
  center: { textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radii.md, borderWidth: 1, minHeight: 88 },
  thumb: { width: 60, height: 60 },
  label: { flex: 1, gap: Spacing.one },
  more: { alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: Radii.md, borderWidth: 1, borderStyle: 'dashed' },
});
