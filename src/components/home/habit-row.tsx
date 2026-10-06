import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Point } from '@/components/home/energy-bolts';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HabitRowProps = {
  emoji: string;
  label: string;
  done: boolean;
  /** What ticking it earns right now, e.g. "+5 ⚡" or "+1 💎". */
  reward: string;
  onToggle: () => void;
  /** Ticking starts, with the tick's centre on screen, so energy can fly from it. */
  onTickStart?: (from: Point) => void;
  /** Tapping the name opens the habit for editing. */
  onEdit?: () => void;
};

/** How long a ticked habit stays in place before moving to Done today. */
const MOVE_AFTER_MS = 550;

export function HabitRow({
  emoji,
  label,
  done,
  reward,
  onToggle,
  onTickStart,
  onEdit,
}: HabitRowProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(1);
  const float = useSharedValue(0);
  const [floating, setFloating] = useState<string | null>(null);
  // Shows the tick straight away, then moves the habit once the tick has played.
  const [ticking, setTicking] = useState(false);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkRef = useRef<View>(null);
  useEffect(
    () => () => {
      if (moveTimer.current) clearTimeout(moveTimer.current);
    },
    [],
  );
  const shownDone = done || ticking;

  const toggle = () => {
    if (ticking) return;
    press.set(withSequence(withSpring(0.8, { damping: 8 }), withSpring(1, { damping: 8 })));
    if (done || reduceMotion) {
      onToggle();
      return;
    }
    setTicking(true);
    checkRef.current?.measureInWindow((x, y, w, h) =>
      onTickStart?.({ x: x + w / 2, y: y + h / 2 }),
    );
    setFloating(reward);
    float.set(0);
    float.set(withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    moveTimer.current = setTimeout(() => {
      setFloating(null);
      setTicking(false);
      onToggle();
    }, MOVE_AFTER_MS);
  };

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));
  const floatStyle = useAnimatedStyle(() => ({
    opacity: 1 - float.value,
    transform: [{ translateY: -44 * float.value }, { scale: 0.8 + float.value * 0.4 }],
  }));

  return (
    <Animated.View
      style={[styles.row, { backgroundColor: shownDone ? theme.primarySoft : theme.artCard }]}>
      <Pressable
        onPress={onEdit}
        disabled={!onEdit}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${label}`}
        style={styles.body}>
        <View style={[styles.emojiWrap, { backgroundColor: theme.bubble }]}>
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        </View>
        <View style={styles.text}>
          <ThemedText
            themeColor={shownDone ? 'inkSecondary' : 'ink'}
            style={[styles.label, shownDone && styles.doneLabel]}>
            {label}
          </ThemedText>
          {!done ? (
            <ThemedText type="small" themeColor="inkSecondary">
              {reward}
            </ThemedText>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        ref={checkRef}
        onPress={toggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: shownDone }}
        accessibilityLabel={label}
        accessibilityHint={done ? 'Tap to undo' : `Tap when done. ${reward}`}>
        <Animated.View
          style={[
            styles.check,
            shownDone
              ? { backgroundColor: theme.primary, borderColor: theme.primary }
              : { backgroundColor: theme.bubble, borderColor: theme.primary },
            checkStyle,
          ]}>
          <ThemedText
            type="smallBold"
            style={[styles.tick, { color: shownDone ? theme.onPrimary : theme.primary }]}>
            ✓
          </ThemedText>
        </Animated.View>
        {floating ? (
          <Animated.View style={[styles.float, floatStyle]} pointerEvents="none">
            <ThemedText type="smallBold" themeColor="ink" style={styles.floatText}>
              {floating}
            </ThemedText>
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    padding: Spacing.two,
    paddingRight: Spacing.three,
    minHeight: 64,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  text: {
    flex: 1,
  },
  label: {
    fontFamily: Fonts.bodyBold,
  },
  doneLabel: {
    textDecorationLine: 'line-through',
  },
  check: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    fontSize: 18,
    lineHeight: 22,
  },
  float: {
    position: 'absolute',
    top: -6,
    left: -14,
    right: -14,
    alignItems: 'center',
  },
  floatText: {
    fontSize: 15,
  },
});
