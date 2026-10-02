import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

type Piece = { angle: number; speed: number; spin: number; size: number; color: string };

const DURATION = 1100;

/**
 * A one-shot burst of paper confetti from the centre of its box. Give it a new
 * `burstKey` to fire again. Renders nothing when the user prefers reduced motion.
 */
export function Confetti({ burstKey, count = 26 }: { burstKey: number; count?: number }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(1);

  const pieces = useMemo<Piece[]>(() => {
    const colors = [theme.gold, theme.mint, theme.primary, theme.confettiPink, theme.confettiBlue];
    // A hash of (burst, piece, channel): each burst looks different, renders stay stable.
    const rand = (i: number, channel: number) => {
      const x = Math.sin(burstKey * 78.233 + i * 12.9898 + channel * 4.1414) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      angle: -Math.PI / 2 + (rand(i, 0) - 0.5) * Math.PI * 1.3,
      speed: 90 + rand(i, 1) * 120,
      spin: (rand(i, 2) - 0.5) * 720,
      size: 6 + rand(i, 3) * 5,
      color: colors[i % colors.length],
    }));
  }, [burstKey, count, theme]);

  useEffect(() => {
    if (burstKey === 0 || reduceMotion) return;
    t.value = 0;
    t.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.quad) });
  }, [burstKey, reduceMotion, t]);

  if (burstKey === 0 || reduceMotion) return null;

  return (
    <View style={styles.origin} pointerEvents="none">
      {pieces.map((piece, i) => (
        <ConfettiPiece key={`${burstKey}-${i}`} piece={piece} t={t} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece, t }: { piece: Piece; t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const x = Math.cos(piece.angle) * piece.speed * t.value;
    // Up and out, then gravity pulls it down.
    const y = Math.sin(piece.angle) * piece.speed * t.value + 160 * t.value * t.value;
    return {
      opacity: t.value < 0.75 ? 1 : (1 - t.value) * 4,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${piece.spin * t.value}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        { width: piece.size, height: piece.size * 0.6, backgroundColor: piece.color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  origin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
    overflow: 'visible',
  },
  piece: {
    position: 'absolute',
    borderRadius: 1,
  },
});
