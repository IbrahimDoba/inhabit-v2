import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EnergyBar } from '@/components/energy-bar';
import { Confetti } from '@/components/home/confetti';
import { DiamondPill } from '@/components/home/diamond-pill';
import { DragonStage } from '@/components/home/dragon-stage';
import { FullBarMoment } from '@/components/home/full-bar-moment';
import { HabitRow } from '@/components/home/habit-row';
import { HomecomingMoment } from '@/components/home/homecoming-moment';
import { JourneyCard } from '@/components/home/journey-card';
import { Toast, useToasts } from '@/components/home/toast';
import { PrimaryButton } from '@/components/primary-button';
import { GardenScene, type DragonMotion, type GardenPlant } from '@/components/scene/garden-scene';
import { TrailScene } from '@/components/scene/trail-scene';
import { ThemedText } from '@/components/themed-text';
import { PLANT_SPRITES } from '@/constants/plant-sprites';
import { PANEL_DAY, PANEL_NIGHT } from '@/constants/sky';
import { MaxContentWidth, Radii, Spacing, TabBarTopInset } from '@/constants/theme';
import {
  canStartJourney,
  fullBar,
  journeyProgress,
  mood,
  type CompanionEvent,
} from '@/engine/companion';
import {
  ENERGY_PER_HABIT,
  EXTRA_HABIT_DIAMONDS,
  FIRST_JOURNEY_BONUS,
  STAGE_RULES,
  type PropId,
} from '@/engine/rules';
import { GIFT_NAMES, JOURNEY_STORIES, PROP_NAMES, tellStory } from '@/engine/stories';
import { dayKey, daysBetween } from '@/engine/time';
import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { useNow } from '@/hooks/use-now';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useSky } from '@/hooks/use-sky';
import { useStatusBarOverride } from '@/hooks/use-status-bar';
import { ColorSchemeOverride, useTheme } from '@/hooks/use-theme';
import { groupForDay, type TimeOfDay } from '@/lib/habits';
import { plantFor, STAGE_LABELS } from '@/lib/plants';
import { mixHex } from '@/lib/sky';

const CHEERS = ['Nicely done!', 'You did it!', 'Hooray!', 'Lovely!', 'Way to go!'];
/** On phones the native tab bar floats over the bottom of the screen; keep toasts above it. */
const TAB_BAR_CLEARANCE = Platform.OS === 'web' ? 0 : 64;


function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  return (
    // Home sits on the daytime garden, so it keeps light colours in dark mode.
    <ColorSchemeOverride.Provider value="light">
      <HomeContent />
    </ColorSchemeOverride.Provider>
  );
}

function HomeContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const { sky } = useSky();
  const { setOverride } = useStatusBarOverride();
  // Light status bar text over a dark sky, only while Home is the focused tab.
  const lightBar = sky.night > 0.5;
  useFocusEffect(
    useCallback(() => {
      setOverride(lightBar ? 'light' : 'dark');
      return () => setOverride(null);
    }, [lightBar, setOverride]),
  );
  const { dragonName, userName, habitIds } = useOnboarding();
  const companion = useCompanion();
  const { companion: state, begin, refresh } = companion;
  const { habits, seed, log, logDone, unlogDone } = useHabits();
  const toasts = useToasts();
  const [hopKey, setHopKey] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const [newGift, setNewGift] = useState<PropId | null>(null);
  const [visit, setVisit] = useState<{ key: string; nonce: number } | null>(null);

  const away = !!state?.journey;
  const now = useNow(away);
  const returnsAt = state?.journey?.returnsAt ?? null;

  // Older saves may have finished onboarding before the dragon was stored.
  useEffect(() => {
    if (!state) begin();
  }, [state, begin]);

  // Saves from before habits were editable: copy the starter picks in once.
  useEffect(() => {
    if (!habits) seed(habitIds);
  }, [habits, seed, habitIds]);

  // Bring the dragon home the moment its countdown ends.
  useEffect(() => {
    if (returnsAt !== null && now >= returnsAt) refresh();
  }, [now, returnsAt, refresh]);

  if (!state) return null;

  const all = habits ?? [];
  const isDone = (id: string) => state.habitsDoneToday.includes(id);
  const groups = groupForDay(all, new Date(now));
  const dueCount = groups.reduce((n, g) => n + g.habits.length, 0);
  const pendingCount = groups.reduce((n, g) => n + g.habits.filter((h) => !isDone(h.id)).length, 0);
  // Done today includes habits no longer due (edited or deleted after ticking).
  const done = all.filter((h) => isDone(h.id));
  const addHabit = (time?: TimeOfDay) =>
    router.push(time ? { pathname: '/habit/[id]', params: { id: 'new', time } } : '/habit/new');
  const editHabit = (id: string) => router.push({ pathname: '/habit/[id]', params: { id } });
  const bar = fullBar(state);
  const habitsToFull = Math.ceil((bar - state.energy) / ENERGY_PER_HABIT);
  const hour = new Date(now).getHours();
  const reward = state.fullCareToday ? `+${EXTRA_HABIT_DIAMONDS} 💎` : `+${ENERGY_PER_HABIT} ⚡`;
  const trip = state.homecoming;
  // Taller than wide, like Finch: open sky under the greeting, meadow below.
  const sceneHeight = Math.round(Math.min(Math.max(window.width * 1.22, 380), window.height * 0.62));
  const headerSpace = insets.top + TabBarTopInset + 64;
  const panel = mixHex(PANEL_DAY, PANEL_NIGHT, sky.night);
  // Text drawn straight on the sky turns light once it gets dark.
  const nightText = sky.night > 0.5;
  const stage = (motion?: DragonMotion) => (
    <DragonStage
      pose={motion?.pose}
      flip={motion?.flip}
      name={dragonName}
      mood={mood(state, now)}
      away={away}
      hopKey={hopKey}
      onTapWhileAway={() =>
        toasts.show({
          title: `${dragonName} is away exploring`,
          subtitle: 'There will be a story when they get back!',
        })
      }
    />
  );
  const exploredToday = state.journeyStartedOn === state.today && !state.journey && !trip;

  const react = (events: CompanionEvent[]) => {
    for (const event of events) {
      if (event.type === 'energy' && event.gained > 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setHopKey((k) => k + 1);
        setBurstKey((k) => k + 1);
        toasts.show({
          title: CHEERS[state.habitsDoneToday.length % CHEERS.length],
          subtitle: `+${event.gained} energy for ${dragonName}`,
        });
      }
      if (event.type === 'diamonds' && event.reason === 'extraHabit') {
        setHopKey((k) => k + 1);
        toasts.show({ title: 'Bonus diamond!', subtitle: 'Extra habits still count.' });
      }
    }
  };

  const plantOf = (id: string, doneDays: readonly string[]) => {
    const habit = all.find((h) => h.id === id);
    return plantFor(id, habit?.plant, doneDays, dayKey(habit?.createdAt ?? now), state.today);
  };

  const toggle = (id: string, isDone: boolean) => {
    if (isDone) {
      companion.undoHabit(id);
      unlogDone(id, state.today);
      return;
    }
    const before = plantOf(id, log[id] ?? []);
    react(companion.completeHabit(id));
    logDone(id, state.today);
    // Walk over and tend its plant (the garden ignores habits without a spot).
    if (!state.journey) setVisit((v) => ({ key: id, nonce: (v?.nonce ?? 0) + 1 }));
    const after = plantOf(id, [...(log[id] ?? []), state.today]);
    const title = all.find((h) => h.id === id)?.title ?? 'Your';
    if (after.growth !== before.growth) {
      toasts.show({ title: `Your "${title}" plant is ${STAGE_LABELS[after.growth]}!`, subtitle: 'It grows every time you do it.', expression: 'proud' });
    } else if (before.resting) {
      toasts.show({ title: `Your "${title}" plant woke up!`, subtitle: 'It missed you. Welcome back.' });
    }
  };

  const gardenPlants: GardenPlant[] = all.map((habit) => {
    const plant = plantOf(habit.id, log[habit.id] ?? []);
    return {
      key: habit.id,
      sprite: PLANT_SPRITES[plant.species][plant.sprite],
      label: `${habit.title}, ${STAGE_LABELS[plant.sprite]}`,
      onPress: () => router.push({ pathname: '/plant/[id]', params: { id: habit.id } }),
    };
  });

  const explore = () => {
    companion.dismissCelebration();
    const events = companion.startJourney();
    if (events.some((e) => e.type === 'journeyStarted')) {
      toasts.show({
        title: `${dragonName} set off exploring!`,
        subtitle: `Back in ${STAGE_RULES[state.stage].journeyHours} hours with a surprise.`,
        expression: 'proud',
      });
    }
  };

  const collect = () => {
    setStoryOpen(false);
    const events = companion.collectHomecoming();
    const placed = events.find((e) => e.type === 'giftPlaced');
    if (placed?.type === 'giftPlaced') {
      const name = GIFT_NAMES[placed.spot.prop];
      setNewGift(placed.spot.prop);
      setTimeout(() => setNewGift(null), 2500);
      toasts.show(
        placed.upgraded
          ? {
              title: 'Your garden got even nicer!',
              subtitle: `Your ${PROP_NAMES[placed.spot.prop]} grew fancier.`,
              expression: 'proud',
            }
          : {
              title: 'A new gift in your garden!',
              subtitle: `${name.charAt(0).toUpperCase()}${name.slice(1)}, from ${dragonName}.`,
              expression: 'happy',
            },
      );
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: panel }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ height: sceneHeight }}>
          {away ? (
            <TrailScene
              sky={sky}
              width={window.width}
              height={sceneHeight}
              fadeTo={panel}
              topInset={headerSpace}>
              {stage()}
            </TrailScene>
          ) : (
            <GardenScene
              sky={sky}
              width={window.width}
              height={sceneHeight}
              fadeTo={panel}
              topInset={headerSpace}
              plants={gardenPlants}
              gifts={state.garden}
              newGift={newGift}
              visit={visit}>
              {(motion) => stage(motion)}
            </GardenScene>
          )}
          <View style={styles.confetti} pointerEvents="none">
            <Confetti burstKey={burstKey} />
          </View>
          <View
            style={[styles.header, { paddingTop: insets.top + Spacing.two + TabBarTopInset }]}
            pointerEvents="box-none">
            <View style={styles.hello}>
              <ThemedText
                type="subtitle"
                themeColor={nightText ? undefined : 'ink'}
                style={nightText ? { color: theme.onMoment } : undefined}>
                {userName ? `${greeting(hour)}, ${userName}` : greeting(hour)}
              </ThemedText>
              <ThemedText
                type="small"
                themeColor={nightText ? undefined : 'inkSecondary'}
                style={nightText ? { color: theme.onMomentMuted } : undefined}>
                Day {daysBetween(state.hatchedOn, dayKey(now)) + 1} with {dragonName}
              </ThemedText>
            </View>
            <DiamondPill diamonds={state.diamonds} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.artCard }]}>
            {state.journey ? (
              <>
                <JourneyCard
                  petName={dragonName}
                  remainingMs={state.journey.returnsAt - now}
                  progress={journeyProgress(state, now)}
                />
                {__DEV__ ? (
                  <Pressable onPress={companion.devFinishJourney} accessibilityRole="button">
                    <ThemedText type="small" themeColor="inkSecondary" style={styles.dev}>
                      Skip to return (developer)
                    </ThemedText>
                  </Pressable>
                ) : null}
              </>
            ) : trip ? (
              <>
                <ThemedText type="smallBold" themeColor="ink">
                  🎒 {dragonName} is back from exploring!
                </ThemedText>
                <PrimaryButton label="Hear the story" onPress={() => setStoryOpen(true)} />
              </>
            ) : (
              <>
                <EnergyBar value={state.energy} max={bar} />
                {canStartJourney(state) ? (
                  <PrimaryButton label={`Send ${dragonName} exploring`} onPress={explore} />
                ) : (
                  <ThemedText type="small" themeColor="inkSecondary">
                    {exploredToday
                      ? `${dragonName} already explored today. A new adventure tomorrow!`
                      : state.fullCareToday
                        ? `${dragonName} is full of energy!`
                        : `Do ${habitsToFull} more ${habitsToFull === 1 ? 'habit' : 'habits'} to fill ${dragonName}'s energy.`}
                  </ThemedText>
                )}
              </>
            )}
          </View>

          <ThemedText type="smallBold" themeColor="ink">
            {dueCount === 0
              ? 'Nothing planned today. Add a habit to get started.'
              : pendingCount === 0
                ? 'All done for today 🎉'
                : `${pendingCount} ${pendingCount === 1 ? 'habit' : 'habits'} left for today`}
          </ThemedText>

          {groups.map((group) => {
            const pending = group.habits.filter((h) => !isDone(h.id));
            if (pending.length === 0) return null;
            return (
              <View key={group.id} style={styles.section}>
                <View style={styles.groupHeader}>
                  <ThemedText type="smallBold" themeColor="inkSecondary">
                    {group.emoji} {group.label}
                  </ThemedText>
                  <Pressable
                    onPress={() => addHabit(group.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add a habit to ${group.label}`}
                    hitSlop={10}
                    style={[styles.groupAdd, { backgroundColor: theme.artCard }]}>
                    <ThemedText type="smallBold" themeColor="ink">
                      +
                    </ThemedText>
                  </Pressable>
                </View>
                {pending.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    emoji={habit.emoji}
                    label={habit.title}
                    done={false}
                    reward={reward}
                    onToggle={() => toggle(habit.id, false)}
                    onEdit={() => editHabit(habit.id)}
                  />
                ))}
              </View>
            );
          })}

          <Pressable
            onPress={() => addHabit()}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.addHabit,
              { borderColor: theme.primary, backgroundColor: theme.artCard },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" themeColor="primary">
              + Add a habit
            </ThemedText>
          </Pressable>

          {done.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="smallBold" themeColor="inkSecondary">
                Done today · tap the tick to undo
              </ThemedText>
              {done.map((habit) => (
                <HabitRow
                  key={habit.id}
                  emoji={habit.emoji}
                  label={habit.title}
                  done
                  reward={reward}
                  onToggle={() => toggle(habit.id, true)}
                  onEdit={() => editHabit(habit.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

        <View
          style={[styles.toastLayer, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]}
          pointerEvents="none">
          <Toast message={toasts.current} />
        </View>

      <FullBarMoment
        visible={!!companion.celebration}
        name={dragonName}
        stage={state.stage}
        stageDays={state.stageDays}
        grewUp={companion.celebration?.grewUp ?? null}
        canExplore={canStartJourney(state)}
        onExplore={explore}
        onClose={companion.dismissCelebration}
      />

      {trip ? (
        <HomecomingMoment
          visible={storyOpen}
          name={dragonName}
          story={tellStory(JOURNEY_STORIES[trip.storyIndex], dragonName, trip.gift)}
          diamonds={trip.diamonds}
          welcomeBonus={state.journeysCompleted === 0 ? FIRST_JOURNEY_BONUS : 0}
          giftName={GIFT_NAMES[trip.gift]}
          onCollect={collect}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingBottom: Spacing.six * 2,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  confetti: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60,
    height: 220,
  },
  hello: {
    flex: 1,
  },
  card: {
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupAdd: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHabit: {
    minHeight: 52,
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  dev: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  toastLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 120,
  },
});
