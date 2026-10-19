import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingPage } from '@/components/onboarding-page';
import { PrimaryButton } from '@/components/primary-button';
import { IconPebble } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ENERGY_PER_HABIT, STARTER_HABIT_COUNT } from '@/constants/starter-habits';
import { Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';
import { rankStarterHabits } from '@/lib/starter-plan';

export default function HabitsScreen() {
  const theme = useTheme();
  const { dragonName, quizAnswers, habitIds, setHabitIds } = useOnboarding();
  // Best matches for the quiz answers first, so the picks sit at the top.
  const [ranked] = useState(() => rankStarterHabits(quizAnswers));
  const count = habitIds.length;
  const isFull = count === STARTER_HABIT_COUNT;

  const toggle = (id: string) => {
    if (habitIds.includes(id)) setHabitIds(habitIds.filter((h) => h !== id));
    else if (!isFull) setHabitIds([...habitIds, id]);
  };

  return (
    <OnboardingPage
      title="Your starter plan"
      hint={`${dragonName} picked these for you. Swap any you like. Each gives ${ENERGY_PER_HABIT} energy.`}
      footer={
        <PrimaryButton
          label={isFull ? 'These three' : `Pick ${STARTER_HABIT_COUNT - count} more`}
          onPress={() => router.push('/onboarding/reminder')}
          disabled={!isFull}
        />
      }>
      <View style={styles.grid}>
        {ranked.map((habit) => {
          const isSelected = habitIds.includes(habit.id);
          const isLocked = isFull && !isSelected;
          return (
            <Pressable
              key={habit.id}
              onPress={() => toggle(habit.id)}
              disabled={isLocked}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: isLocked }}
              accessibilityLabel={habit.label}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: isSelected ? theme.primarySoft : theme.artCard,
                  borderColor: isSelected ? theme.primary : 'transparent',
                },
                isLocked && styles.locked,
                pressed && styles.pressed,
              ]}>
              <IconPebble emoji={habit.emoji} size={46} />
              <ThemedText type="smallBold" themeColor="ink" style={styles.label}>
                {habit.label}
              </ThemedText>
              {isSelected ? (
                <View style={[styles.check, { backgroundColor: theme.primary }]}>
                  <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
                    ✓
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <ThemedText type="small" themeColor="inkSecondary" style={styles.note}>
        You can add your own habits once you are in.
      </ThemedText>
    </OnboardingPage>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.two,
  },
  card: {
    width: '48.5%',
    minHeight: 96,
    borderRadius: Radii.lg,
    borderWidth: 2,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  label: {
    lineHeight: 18,
  },
  check: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  note: {
    textAlign: 'center',
  },
});
