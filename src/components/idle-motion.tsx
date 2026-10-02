import { useEffect, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type IdleMotionProps = {
  /** breathe: slow squash and stretch for the dragon. wobble: an egg rocking on its base. */
  kind: 'breathe' | 'wobble';
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Code-driven idle loop for still art. Anchored at the bottom so it rocks from the ground. */
export function IdleMotion({ kind, style, children }: IdleMotionProps) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const ease = Easing.inOut(Easing.sin);
    t.value =
      kind === 'breathe'
        ? withRepeat(withTiming(1, { duration: 1800, easing: ease }), -1, true)
        : withRepeat(
            withSequence(
              withTiming(1, { duration: 180, easing: ease }),
              withTiming(-1, { duration: 360, easing: ease }),
              withTiming(0.5, { duration: 300, easing: ease }),
              withTiming(0, { duration: 240, easing: ease }),
              withDelay(1400, withTiming(0, { duration: 0 })),
            ),
            -1,
          );
  }, [kind, reduceMotion, t]);

  const animatedStyle = useAnimatedStyle(() =>
    kind === 'breathe'
      ? { transform: [{ scaleY: 1 + t.value * 0.025 }, { scaleX: 1 - t.value * 0.012 }] }
      : { transform: [{ rotate: `${t.value * 6}deg` }] },
  );

  return (
    <Animated.View style={[{ transformOrigin: 'bottom' }, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
