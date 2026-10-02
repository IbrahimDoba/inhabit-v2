import { useState } from 'react';
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
  /** Tapping the name opens the habit for editing. */
  onEdit?: () => void;
};

export function HabitRow({ emoji, label, done, reward, onToggle, onEdit }: HabitRowProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(1);
  const float = useSharedValue(0);
  const [floating, setFloating] = useState<string | null>(null);

  const toggle = () => {
    press.set(withSequence(withSpring(0.8, { damping: 8 }), withSpring(1, { damping: 8 })));
    if (!done && !reduceMotion) {
      setFloating(reward);
      float.set(0);
      float.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
      setTimeout(() => setFloating(null), 950);
    }
    onToggle();
  };

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const floatStyle = useAnimatedStyle(() => ({
    opacity: 1 - float.value,
    transform: [{ translateY: -44 * float.value }, { scale: 0.8 + float.value * 0.4 }],
  }));

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: done ? theme.primarySoft : theme.artCard },
      ]}>
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
          themeColor={done ? 'inkSecondary' : 'ink'}
          style={[styles.label, done && styles.doneLabel]}>
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
        onPress={toggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={label}
        accessibilityHint={done ? 'Tap to undo' : `Tap when done. ${reward}`}>
        <Animated.View
          style={[
            styles.check,
            done
              ? { backgroundColor: theme.primary, borderColor: theme.primary }
              : { backgroundColor: theme.bubble, borderColor: theme.primary },
            checkStyle,
          ]}>
          <ThemedText
            type="smallBold"
            style={[styles.tick, { color: done ? theme.onPrimary : theme.primary }]}>
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
    </View>
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
