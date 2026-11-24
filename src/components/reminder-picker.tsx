import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  defaultReminderTime,
  formatTime,
  REMINDER_PRESETS,
  shiftTime,
} from '@/lib/habit-reminders';
import type { TimeOfDay } from '@/lib/habits';
import { remindersSupported, requestReminderPermission } from '@/lib/reminders';

type ReminderPickerProps = {
  /** "08:30", or undefined when off. */
  value: string | undefined;
  timeOfDay: TimeOfDay;
  onChange: (value: string | undefined) => void;
};

/**
 * Turns a habit's reminder on or off and picks its time: quick picks that fit the
 * time of day, plus 15-minute steps either way. Asks for notification permission
 * the first time it is switched on.
 */
export function ReminderPicker({ value, timeOfDay, onChange }: ReminderPickerProps) {
  const theme = useTheme();
  const [note, setNote] = useState<string | null>(null);
  const on = value !== undefined;

  const toggle = async (next: boolean) => {
    setNote(null);
    if (!next) {
      onChange(undefined);
      return;
    }
    if (!remindersSupported) {
      setNote('Reminders work in the phone app.');
      return;
    }
    if (!(await requestReminderPermission())) {
      setNote('Notifications are off for DragonDen Garden. Turn them on in your phone’s Settings to get reminders.');
      return;
    }
    onChange(defaultReminderTime(timeOfDay));
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <ThemedText type="smallBold">🔔 Remind me</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {on
              ? `At ${formatTime(value)} on the days it’s due. Skipped once it’s done.`
              : 'A gentle nudge on the days it’s due.'}
          </ThemedText>
        </View>
        <Switch
          value={on}
          onValueChange={toggle}
          trackColor={{ true: theme.primary, false: theme.surfaceMuted }}
          accessibilityLabel="Remind me"
        />
      </View>

      {on ? (
        <>
          <View style={styles.stepper}>
            <Step label="−15 min" onPress={() => onChange(shiftTime(value, -15))} />
            <ThemedText type="subtitle" style={styles.time} accessibilityLiveRegion="polite">
              {formatTime(value)}
            </ThemedText>
            <Step label="+15 min" onPress={() => onChange(shiftTime(value, 15))} />
          </View>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {REMINDER_PRESETS[timeOfDay].map((t) => (
              <Chip key={t} label={formatTime(t)} selected={value === t} onPress={() => onChange(t)} />
            ))}
          </View>
        </>
      ) : null}

      {note ? (
        <ThemedText type="small" themeColor="danger">
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

function Step({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.step,
        { backgroundColor: theme.surfaceMuted },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" themeColor="primary">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
    gap: Spacing.half,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  time: {
    fontVariant: ['tabular-nums'],
  },
  step: {
    minHeight: 40,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
