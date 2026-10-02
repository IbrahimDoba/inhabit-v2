import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { PlantPicker } from '@/components/plant-picker';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { HABIT_EMOJI, SUGGESTION_GROUPS } from '@/constants/habit-suggestions';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useHabits, type HabitDraft } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import {
  describeDays,
  EVERY_DAY,
  HABIT_TITLE_MAX,
  TIMES_OF_DAY,
  validateHabit,
  WEEKDAYS,
  WEEKEND,
  WORKDAYS,
  type TimeOfDay,
  type Weekday,
} from '@/lib/habits';

const PRESETS: readonly { label: string; days: readonly Weekday[] }[] = [
  { label: 'Every day', days: EVERY_DAY },
  { label: 'Weekdays', days: WORKDAYS },
  { label: 'Weekends', days: WEEKEND },
];

function sameDays(a: readonly Weekday[], b: readonly Weekday[]) {
  return a.length === b.length && a.every((d) => b.includes(d));
}

/** Add a habit (`/habit/new`, optionally `?time=evening`) or edit one (`/habit/<id>`). */
export default function HabitEditorScreen() {
  const theme = useTheme();
  const { id, time } = useLocalSearchParams<{ id: string; time?: TimeOfDay }>();
  const { habits, add, update, remove } = useHabits();
  const existing = id === 'new' ? undefined : habits?.find((h) => h.id === id);
  const isNew = !existing;

  const [draft, setDraft] = useState<HabitDraft>(() =>
    existing
      ? {
          title: existing.title,
          emoji: existing.emoji,
          timeOfDay: existing.timeOfDay,
          days: existing.days,
          plant: existing.plant,
        }
      : { title: '', emoji: '✨', timeOfDay: time ?? 'any', days: [...EVERY_DAY], plant: 'sunflower' },
  );
  const [group, setGroup] = useState(SUGGESTION_GROUPS[0].id);
  const [showEmoji, setShowEmoji] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (patch: Partial<HabitDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  };

  const toggleDay = (day: Weekday) =>
    set({
      days: draft.days.includes(day) ? draft.days.filter((d) => d !== day) : [...draft.days, day],
    });

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const onSave = () => {
    const problem = validateHabit(draft);
    if (problem) {
      setError(problem);
      return;
    }
    if (existing) update(existing.id, draft);
    else add(draft);
    close();
  };

  const onDelete = () => {
    if (!existing) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    remove(existing.id);
    close();
  };

  if (id !== 'new' && habits && !existing) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        <View style={styles.missing}>
          <ThemedText type="subtitle">This habit is gone.</ThemedText>
          <PrimaryButton label="Back" onPress={close} />
        </View>
      </SafeAreaView>
    );
  }

  const activeGroup = SUGGESTION_GROUPS.find((g) => g.id === group) ?? SUGGESTION_GROUPS[0];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Pressable onPress={close} accessibilityRole="button" hitSlop={8}>
            <ThemedText themeColor="textSecondary">Cancel</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">{isNew ? 'New habit' : 'Edit habit'}</ThemedText>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Pressable
              onPress={() => setShowEmoji((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={`Icon ${draft.emoji}. Tap to change`}
              style={[styles.emojiButton, { backgroundColor: theme.primarySoft }]}>
              <ThemedText style={styles.emojiBig}>{draft.emoji}</ThemedText>
            </Pressable>
            <TextInput
              value={draft.title}
              onChangeText={(title) => set({ title })}
              placeholder="What will you do?"
              placeholderTextColor={theme.textSecondary}
              maxLength={HABIT_TITLE_MAX}
              autoFocus={isNew}
              returnKeyType="done"
              accessibilityLabel="Habit name"
              style={[styles.titleInput, { color: theme.text }]}
            />
          </View>

          {showEmoji ? (
            <View style={styles.emojiGrid} accessibilityRole="radiogroup">
              {HABIT_EMOJI.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => {
                    set({ emoji });
                    setShowEmoji(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: emoji === draft.emoji }}
                  accessibilityLabel={emoji}
                  style={[
                    styles.emojiCell,
                    {
                      backgroundColor: emoji === draft.emoji ? theme.primarySoft : theme.surface,
                      borderColor: emoji === draft.emoji ? theme.primary : theme.border,
                    },
                  ]}>
                  <ThemedText style={styles.emojiSmall}>{emoji}</ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}

          {isNew ? (
            <View style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                IDEAS
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {SUGGESTION_GROUPS.map((g) => (
                  <Chip key={g.id} label={g.label} selected={g.id === group} onPress={() => setGroup(g.id)} />
                ))}
              </ScrollView>
              <View style={[styles.list, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {activeGroup.items.map((item, i) => (
                  <Pressable
                    key={item.title}
                    onPress={() => set({ title: item.title, emoji: item.emoji, timeOfDay: item.timeOfDay })}
                    accessibilityRole="button"
                    accessibilityLabel={`Use suggestion: ${item.title}`}
                    style={({ pressed }) => [
                      styles.suggestion,
                      i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
                      pressed && { backgroundColor: theme.surfaceMuted },
                    ]}>
                    <ThemedText style={styles.emojiSmall}>{item.emoji}</ThemedText>
                    <ThemedText style={styles.flex}>{item.title}</ThemedText>
                    <ThemedText themeColor="primary">+</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              WHEN
            </ThemedText>
            <View style={styles.wrap} accessibilityRole="radiogroup">
              {TIMES_OF_DAY.map((t) => (
                <Chip
                  key={t.id}
                  label={`${t.emoji} ${t.label}`}
                  selected={draft.timeOfDay === t.id}
                  onPress={() => set({ timeOfDay: t.id })}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              HOW OFTEN · {describeDays(draft.days).toUpperCase() || 'NO DAYS'}
            </ThemedText>
            <View style={styles.wrap} accessibilityRole="radiogroup">
              {PRESETS.map((p) => (
                <Chip
                  key={p.label}
                  label={p.label}
                  selected={sameDays(draft.days, p.days)}
                  onPress={() => set({ days: [...p.days] })}
                />
              ))}
            </View>
            <View style={styles.days}>
              {WEEKDAYS.map((d) => {
                const on = draft.days.includes(d.id);
                return (
                  <Pressable
                    key={d.id}
                    onPress={() => toggleDay(d.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={d.short}
                    style={[
                      styles.day,
                      {
                        backgroundColor: on ? theme.primary : theme.surface,
                        borderColor: on ? theme.primary : theme.border,
                      },
                    ]}>
                    <ThemedText type="smallBold" style={{ color: on ? theme.onPrimary : theme.text }}>
                      {d.letter}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              ITS PLANT
            </ThemedText>
            <PlantPicker selected={draft.plant} onSelect={(plant) => set({ plant })} />
          </View>

          {existing ? (
            <Pressable onPress={onDelete} accessibilityRole="button" style={styles.delete}>
              <ThemedText type="smallBold" style={{ color: theme.danger }}>
                {confirmDelete ? 'Tap again to delete this habit' : 'Delete habit'}
              </ThemedText>
            </Pressable>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          {error ? (
            <ThemedText type="small" style={[styles.center, { color: theme.danger }]} accessibilityLiveRegion="polite">
              {error}
            </ThemedText>
          ) : null}
          <PrimaryButton label={isNew ? 'Add habit' : 'Save changes'} onPress={onSave} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  missing: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  topBarSpacer: {
    width: 52,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBig: {
    fontSize: 30,
    lineHeight: 38,
  },
  titleInput: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 20,
    minHeight: 48,
    outlineWidth: 0,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSmall: {
    fontSize: 22,
    lineHeight: 28,
  },
  section: {
    gap: Spacing.two,
  },
  chips: {
    gap: Spacing.two,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  list: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delete: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
});
