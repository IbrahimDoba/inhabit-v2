import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

export type Point = { x: number; y: number };
export type BoltFlight = {
  id: number;
  from: Point;
  to: Point;
  /** What flies: ⚡ by default; 💎 for rewards. */
  icon?: string;
  count?: number;
};

const BOLTS = 5;
const STAGGER_MS = 70;
/** How long one bolt takes to land. */
export const FLY_MS = 620;
/** From take-off until the last of `count` lands. */
export const flightMs = (count = BOLTS) => FLY_MS + STAGGER_MS * (count - 1);
export const BOLT_FLIGHT_MS = flightMs();

/** Each bolt leaves on its own little arc, so they fan out and meet at the bar. */
const ARCS = [
  { lift: 70, side: -36 },
  { lift: 110, side: 18 },
  { lift: 50, side: 40 },
  { lift: 95, side: -12 },
  { lift: 80, side: 28 },
];

/**
 * Little things flying on arcs: bolts from a ticked habit into the energy bar, or
 * diamonds into the counter. Positions are in this layer's space.
 */
export function EnergyBolts({ flights }: { flights: readonly BoltFlight[] }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flights.flatMap((flight) =>
        Array.from({ length: flight.count ?? BOLTS }, (_, i) => (
          <Bolt
            key={`${flight.id}-${i}`}
            icon={flight.icon ?? '⚡'}
            from={flight.from}
            to={flight.to}
            delay={i * STAGGER_MS}
            {...ARCS[i % ARCS.length]}
          />
        )),
      )}
    </View>
  );
}

function Bolt({
  icon,
  from,
  to,
  delay,
  lift,
  side,
}: {
  icon: string;
  from: Point;
  to: Point;
  delay: number;
  lift: number;
  side: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.set(
      withDelay(delay, withTiming(1, { duration: FLY_MS, easing: Easing.inOut(Easing.cubic) })),
    );
  }, [t, delay]);

  const style = useAnimatedStyle(() => {
    const p = t.get();
    const bend = Math.sin(Math.PI * p);
    const x = from.x + (to.x - from.x) * p + side * bend;
    const y = from.y + (to.y - from.y) * p - lift * bend;
    const scale = p < 0.15 ? 0.4 + (p / 0.15) * 0.8 : 1.2 - (p - 0.15) * 0.7;
    return {
      opacity: p === 0 || p >= 1 ? 0 : 1,
      transform: [{ translateX: x - SIZE / 2 }, { translateY: y - SIZE / 2 }, { scale }],
    };
  });

  return (
    <Animated.View style={[styles.bolt, style]}>
      <ThemedText style={styles.icon}>{icon}</ThemedText>
    </Animated.View>
  );
}

const SIZE = 28;

const styles = StyleSheet.create({
  bolt: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    lineHeight: 26,
  },
});
