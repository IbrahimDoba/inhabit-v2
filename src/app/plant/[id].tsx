import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlantPicker } from '@/components/plant-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { PLANT_SPRITES } from '@/constants/plant-sprites';
import { PLANTS } from '@/constants/plants';
import { PANEL_DAY } from '@/constants/sky';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { dayKey } from '@/engine/time';
import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { isDueOn, type Weekday } from '@/lib/habits';
import {
  habitStreak,
  plantFor,
  recentDays,
  STAGE_LABELS,
  STAGE_THRESHOLDS,
} from '@/lib/plants';

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** One habit's plant: what it means, how it is growing, and what to do next. */
export default function PlantScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, log, logDone, update } = useHabits();
  const { companion, completeHabit } = useCompanion();
  const now = useNow(false);
  const [picking, setPicking] = useState(false);
  const [justTended, setJustTended] = useState(false);

  const habit = habits?.find((h) => h.id === id);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!habit || !companion) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        <View style={styles.missing}>
          <ThemedText type="subtitle">This plant is gone.</ThemedText>
          <PrimaryButton label="Back" onPress={close} />
        </View>
      </SafeAreaView>
    );
  }

  const today = companion.today;
  const doneDays = log[habit.id] ?? [];
  const plant = plantFor(habit.id, habit.plant, doneDays, dayKey(habit.createdAt), today);
  const info = PLANTS[plant.species];
  const sprite = PLANT_SPRITES[plant.species][plant.sprite];
  const heroScale = 150 / PLANT_SPRITES[plant.species].bloom.height;
  const doneToday = doneDays.includes(today);
  const dueToday = isDueOn(habit, new Date(now));
  const streak = habitStreak(habit.days, doneDays, today);
  const week = recentDays(today);
  const next = STAGE_THRESHOLDS.find((t) => t.from > plant.completions);

  const tend = () => {
    completeHabit(habit.id);
    logDone(habit.id, today);
    setJustTended(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Pressable onPress={close} accessibilityRole="button" hitSlop={8}>
          <ThemedText themeColor="textSecondary">Close</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: '/habit/[id]', params: { id: habit.id } })}
          accessibilityRole="button"
          hitSlop={8}>
          <ThemedText themeColor="primary">Edit habit</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: PANEL_DAY }]}>
          <Animated.View key={`${plant.species}-${plant.sprite}`} entering={ZoomIn.springify().damping(12)}>
            <Image
              source={sprite.source}
              style={{ width: sprite.width * heroScale, height: sprite.height * heroScale }}
              contentFit="contain"
              accessibilityLabel={`${info.name}, ${STAGE_LABELS[plant.sprite]}`}
            />
          </Animated.View>
          {justTended ? (
            <Animated.View entering={FadeIn.duration(300)} style={[styles.sparkle, { backgroundColor: theme.bubble }]}>
              <ThemedText type="smallBold" themeColor="ink">
                ✨ Tended today
              </ThemedText>
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.titles}>
          <ThemedText type="title">
            {info.emoji} {info.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            Grows from {habit.emoji} {habit.title}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="primary">
            MEANING · {info.meaning.toUpperCase()}
          </ThemedText>
          <ThemedText>{info.about}</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            GROWTH
          </ThemedText>
          <View style={styles.track}>
            {STAGE_THRESHOLDS.map((t, i) => {
              const reached = plant.completions >= t.from;
              return (
                <View key={t.stage} style={styles.trackStep}>
                  {i > 0 ? (
                    <View
                      style={[
                        styles.trackLine,
                        { backgroundColor: reached ? theme.primary : theme.border },
                      ]}
                    />
                  ) : null}
                  <View
                    style={[
                      styles.trackDot,
                      {
                        backgroundColor: reached ? theme.primary : theme.surface,
                        borderColor: reached ? theme.primary : theme.border,
                      },
                    ]}
                  />
                  <ThemedText type="small" themeColor={reached ? 'text' : 'textSecondary'}>
                    {t.stage.charAt(0).toUpperCase() + t.stage.slice(1)}
                  </ThemedText>
                </View>
              );
            })}
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {plant.resting
              ? `Resting after a few quiet days. It keeps all its growth, and wakes up the next time you ${habit.title.toLowerCase()}.`
              : next
                ? `${plant.toNext} more ${plant.toNext === 1 ? 'time' : 'times'} until it is ${STAGE_LABELS[next.stage]}.`
                : 'Fully grown. Keep it company and it stays in bloom.'}
          </ThemedText>
        </View>

        <View style={styles.stats}>
          <Stat value={String(plant.completions)} label={plant.completions === 1 ? 'time done' : 'times done'} />
          <Stat value={String(streak)} label={streak === 1 ? 'day streak' : 'day streak'} />
          <Stat
            value={new Date(habit.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            label="planted"
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            LAST 7 DAYS
          </ThemedText>
          <View style={styles.week}>
            {week.map((day) => {
              const [y, m, d] = day.split('-').map(Number);
              const date = new Date(y, m - 1, d);
              const done = doneDays.includes(day);
              const due = habit.days.includes(date.getDay() as Weekday);
              return (
                <View key={day} style={styles.weekDay} accessibilityLabel={`${day}: ${done ? 'done' : due ? 'not done' : 'day off'}`}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {WEEKDAY_LETTERS[date.getDay()]}
                  </ThemedText>
                  <View
                    style={[
                      styles.weekDot,
                      done
                        ? { backgroundColor: theme.primary }
                        : { backgroundColor: 'transparent', borderColor: due ? theme.border : 'transparent', borderWidth: 2 },
                    ]}>
                    {done ? (
                      <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
                        ✓
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => setPicking((p) => !p)}
            accessibilityRole="button"
            accessibilityState={{ expanded: picking }}
            style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              CHANGE PLANT
            </ThemedText>
            <ThemedText themeColor="primary">{picking ? 'Done' : 'Choose'}</ThemedText>
          </Pressable>
          {picking ? (
            <PlantPicker
              selected={plant.species}
              onSelect={(p) => {
                update(habit.id, { title: habit.title, emoji: habit.emoji, timeOfDay: habit.timeOfDay, days: habit.days, plant: p });
                Haptics.selectionAsync();
              }}
            />
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              Swap to any plant you own. Its growth carries over.
            </ThemedText>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {doneToday ? (
          <ThemedText style={styles.center} themeColor="textSecondary">
            ✓ Done for today. See you tomorrow!
          </ThemedText>
        ) : dueToday ? (
          <PrimaryButton label={`Tend it: ${habit.title}`} onPress={tend} />
        ) : (
          <ThemedText style={styles.center} themeColor="textSecondary">
            A day off for this habit. It is not due today.
          </ThemedText>
        )}
      </View>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  missing: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  hero: {
    height: 210,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.three,
  },
  sparkle: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  titles: {
    gap: Spacing.half,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackStep: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  trackLine: {
    position: 'absolute',
    top: 7,
    right: '50%',
    width: '100%',
    height: 3,
  },
  trackDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
    alignItems: 'center',
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  weekDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
});
