import { Image, type ImageSource } from 'expo-image';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import type { DragonPose } from '@/components/dragon-sprite';
import { GardenGift } from '@/components/scene/garden-gift';
import { TendSparkle } from '@/components/scene/tend-sparkle';
import { HabitPlant } from '@/components/scene/habit-plant';
import { SkyBackdrop } from '@/components/scene/sky-backdrop';
import { ThemedText } from '@/components/themed-text';
import type { PlantSprite } from '@/constants/plant-sprites';
import { PROP_SPRITES } from '@/constants/prop-sprites';
import { FIREFLY, WARM_LIGHT } from '@/constants/sky';
import type { GardenSpot } from '@/engine/companion';
import type { PropId } from '@/engine/rules';
import type { SkyState } from '@/lib/sky';

const gardenDay = require('@/assets/images/scene/garden-day.webp');
const gardenNight = require('@/assets/images/scene/garden-night.webp');

type GardenSceneProps = {
  sky: SkyState;
  width: number;
  height: number;
  /** Colour the bottom edge fades into, so the scene melts into the panel below. */
  fadeTo: string;
  /** Space at the top covered by the greeting and bars. */
  topInset?: number;
  /** One plant per habit, placed in the meadow around the dragon. */
  plants?: readonly GardenPlant[];
  /** Gifts from journeys, each in its own spot. */
  gifts?: readonly GardenSpot[];
  /** A gift just brought home, which pops in. */
  newGift?: PropId | null;
  /** The dragon has just come home from exploring: it walks in from the edge of the garden. */
  arriving?: boolean;
  /** A plant for the dragon to walk over to and tend; a new `nonce` starts a new visit. */
  visit?: { key: string; nonce: number } | null;
  /** The dragon, placed standing on the meadow. A function receives how to draw it while it moves. */
  children?: ReactNode | ((motion: DragonMotion) => ReactNode);
};

/** How the dragon should be drawn while the garden moves it around. */
export type DragonMotion = { pose?: DragonPose; flip: boolean };

type VisitPhase = 'home' | 'arriving' | 'going' | 'tending' | 'returning';

/** How long the dragon stays tending a plant before heading back. */
const TEND_MS = 2600;
/** Walking speed across the meadow, in milliseconds per point. */
const MS_PER_POINT = 7;
/**
 * How far the dragon's centre stands from the plant while watering, so the stream
 * from the can (ahead of it in the `water` pose) lands on the plant.
 */
const WATER_REACH = 105;
/** Walking home from the right edge of the garden takes this long. */
const ARRIVE_MS = 2800;
/** A gift's flight from the dragon's bundle to its spot. */
const GIFT_FLIGHT_MS = 1000;

export type GardenPlant = { key: string; sprite: PlantSprite; label: string; onPress: () => void };

/**
 * Spots in the meadow, as (x across the scene, height up the meadow, size).
 * They leave the middle clear for the dragon; front spots draw in front of it.
 * Plants beyond the last spot are not shown yet.
 */
const PLANT_SPOTS: readonly { x: number; up: number; size: number }[] = [
  { x: 0.12, up: 0.1, size: 1 },
  { x: 0.88, up: 0.1, size: 1 },
  { x: 0.24, up: 0.24, size: 0.85 },
  { x: 0.76, up: 0.24, size: 0.85 },
  { x: 0.06, up: 0.34, size: 0.7 },
  { x: 0.94, up: 0.34, size: 0.7 },
  { x: 0.2, up: 0.45, size: 0.6 },
  { x: 0.8, up: 0.45, size: 0.6 },
  { x: 0.33, up: 0.55, size: 0.52 },
  { x: 0.67, up: 0.55, size: 0.52 },
  { x: 0.1, up: 0.58, size: 0.5 },
  { x: 0.9, up: 0.58, size: 0.5 },
];
const FRONT_ROW = 0.15;

/** Where each gift goes, placed between the plant spots so nothing overlaps. */
const GIFT_SPOTS: Record<PropId, { x: number; up: number; size: number }> = {
  flowers: { x: 0.38, up: 0.02, size: 0.9 },
  stones: { x: 0.6, up: 0.0, size: 1 },
  mushrooms: { x: 0.05, up: 0.17, size: 0.85 },
  lantern: { x: 0.95, up: 0.18, size: 0.9 },
  pond: { x: 0.3, up: 0.68, size: 0.9 },
  bench: { x: 0.68, up: 0.7, size: 0.85 },
  fence: { x: 0.87, up: 0.76, size: 0.75 },
};

/** The home garden: code-drawn sky, day and night garden art, and little signs of life. */
export function GardenScene({
  sky,
  width,
  height,
  fadeTo,
  topInset = 0,
  plants = [],
  gifts = [],
  newGift = null,
  arriving = false,
  visit = null,
  children,
}: GardenSceneProps) {
  // The garden art is square with its horizon 40% down. Keep it full width and
  // anchored to the bottom, so a taller scene shows more open sky above it.
  const size = Math.max(width, height * 0.72);
  const horizon = height - size * 0.6;
  const art = { width: size, height: size, left: (width - size) / 2 };
  const meadow = height - horizon;
  const plantScale = Math.min(width / 393, 1.4);

  const reduceMotion = useReducedMotion();
  // Coming home, the dragon starts just past the right edge.
  const walksIn = arriving && !reduceMotion;
  const tx = useSharedValue(walksIn ? width / 2 + 120 : 0);
  const ty = useSharedValue(0);
  const depth = useSharedValue(1);
  const [phase, setPhase] = useState<VisitPhase>(walksIn ? 'arriving' : 'home');
  const [facingLeft, setFacingLeft] = useState(walksIn);
  // A new gift waits in the bundle, flies to its spot, then lands there.
  const [landedGift, setLandedGift] = useState<PropId | null>(null);

  useEffect(() => {
    if (!walksIn) return;
    tx.set(withTiming(0, { duration: ARRIVE_MS, easing: Easing.out(Easing.quad) }));
    const timer = setTimeout(() => {
      setPhase('home');
      setFacingLeft(false);
    }, ARRIVE_MS);
    return () => clearTimeout(timer);
    // Only on the first draw of the garden after the trip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [tendAt, setTendAt] = useState<{ left: number; bottom: number; key: number } | null>(null);

  // Walk to the visited plant, tend it, walk back. A new visit restarts from wherever the dragon is.
  const visitIndex = visit ? plants.findIndex((p) => p.key === visit.key) : -1;
  const visitNonce = visit?.nonce;
  // A visit from before the garden appeared (e.g. before exploring) is not replayed.
  const staleNonce = useRef(visitNonce);
  useEffect(() => {
    if (visitNonce === undefined || visitNonce === staleNonce.current) return;
    if (visitIndex < 0 || visitIndex >= PLANT_SPOTS.length) return;
    const spot = PLANT_SPOTS[visitIndex];
    const scale = spot.size * plantScale;
    const plantX = spot.x * width;
    const targetDepth = 1 - spot.up * 0.5;
    // Plants on the left are watered from their right, facing left, and vice versa.
    const reach = WATER_REACH * targetDepth;
    const standX = spot.x < 0.5 ? plantX + reach : plantX - reach;
    const targetX = Math.max(-width / 2 + 40, Math.min(width / 2 - 40, standX - width / 2));
    const rise = spot.up * meadow + 6 - 34;
    const sparkle = { left: plantX, bottom: spot.up * meadow + 6 + 80 * scale, key: visitNonce };

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (reduceMotion) {
      timers.push(
        setTimeout(() => setTendAt(sparkle), 0),
        setTimeout(() => setTendAt(null), TEND_MS),
      );
      return () => timers.forEach(clearTimeout);
    }

    const fromX = tx.get();
    const out = Math.max(600, Math.min(2000, Math.hypot(targetX - fromX, rise) * MS_PER_POINT));
    const back = Math.max(600, Math.min(2000, Math.hypot(targetX, rise) * MS_PER_POINT));
    const ease = Easing.inOut(Easing.quad);

    timers.push(
      setTimeout(() => {
        setPhase('going');
        setFacingLeft(targetX < fromX);
      }, 0),
    );
    tx.set(withTiming(targetX, { duration: out, easing: ease }));
    ty.set(withTiming(-rise, { duration: out, easing: ease }));
    depth.set(withTiming(targetDepth, { duration: out, easing: ease }));

    timers.push(
      setTimeout(() => {
        setPhase('tending');
        setFacingLeft(spot.x < 0.5);
        setTendAt(sparkle);
      }, out),
      setTimeout(() => {
        setPhase('returning');
        setFacingLeft(targetX > 0);
        setTendAt(null);
        tx.set(withTiming(0, { duration: back, easing: ease }));
        ty.set(withTiming(0, { duration: back, easing: ease }));
        depth.set(withTiming(1, { duration: back, easing: ease }));
      }, out + TEND_MS),
      setTimeout(() => {
        setPhase('home');
        setFacingLeft(false);
      }, out + TEND_MS + back),
    );
    return () => timers.forEach(clearTimeout);
    // Only a new visit starts a walk; layout changes mid-walk are ignored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitNonce]);

  const walkStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.get() }, { translateY: ty.get() }, { scale: depth.get() }],
  }));

  // A new gift flies from the bundle; when it lands it pops into its spot with a sparkle.
  const giftSpot = newGift ? GIFT_SPOTS[newGift] : null;
  useEffect(() => {
    if (!newGift || !giftSpot) return;
    const spot = giftSpot;
    const scale = spot.size * plantScale;
    const sprite = PROP_SPRITES[newGift];
    const timer = setTimeout(
      () => {
        setLandedGift(newGift);
        setTendAt({
          left: spot.x * width,
          bottom: spot.up * meadow + 6 + sprite.height * scale * 0.6,
          key: Date.now(),
        });
      },
      reduceMotion ? 0 : GIFT_FLIGHT_MS,
    );
    const clear = setTimeout(() => setTendAt(null), (reduceMotion ? 0 : GIFT_FLIGHT_MS) + 1800);
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
    };
    // A new gift starts one flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newGift]);
  const giftInFlight = newGift !== null && landedGift !== newGift;

  // Home with the bundle, side-view stroll to walk, the watering pose to tend, flipped to face the way it goes.
  const motion: DragonMotion =
    phase === 'arriving'
      ? { pose: 'walk', flip: facingLeft }
      : phase === 'going' || phase === 'returning'
      ? { pose: 'stroll', flip: facingLeft }
      : phase === 'tending'
        ? { pose: 'water', flip: facingLeft }
        : { flip: false };

  const placedGifts = gifts.filter((gift) => !(giftInFlight && gift.prop === newGift)).map((gift) => {
    const spot = GIFT_SPOTS[gift.prop];
    const sprite = PROP_SPRITES[gift.prop];
    const scale = spot.size * plantScale;
    return {
      spot,
      node: (
        <View
          key={`gift-${gift.prop}`}
          pointerEvents="none"
          style={[
            styles.plant,
            { left: spot.x * width - (sprite.width * scale) / 2, bottom: spot.up * meadow + 6 },
          ]}>
          <GardenGift
            sprite={sprite}
            scale={scale}
            level={gift.level}
            isNew={gift.prop === newGift}
            glow={gift.prop === 'lantern' ? sky.night : 0}
          />
        </View>
      ),
    };
  });

  const placedPlants = plants.slice(0, PLANT_SPOTS.length).map((plant, i) => {
    const spot = PLANT_SPOTS[i];
    const scale = spot.size * plantScale;
    return {
      spot,
      node: (
        <View
          key={plant.key}
          style={[
            styles.plant,
            {
              left: spot.x * width - (plant.sprite.width * scale) / 2,
              bottom: spot.up * meadow + 6,
            },
          ]}>
          <HabitPlant
            sprite={plant.sprite}
            scale={scale}
            phase={i % 4}
            label={plant.label}
            onPress={plant.onPress}
          />
        </View>
      ),
    };
  });
  // Draw from the back of the meadow to the front, with the dragon in between.
  const placed = [...placedPlants, ...placedGifts].sort((a, b) => b.spot.up - a.spot.up);
  const back = placed.filter((p) => p.spot.up >= FRONT_ROW);
  const front = placed.filter((p) => p.spot.up < FRONT_ROW);

  return (
    <View style={[styles.root, { width, height }]}>
      <SkyBackdrop sky={sky} width={width} height={height} horizon={horizon} topInset={topInset} />

      <Image source={gardenDay} style={[styles.art, art]} contentFit="cover" />
      <Image source={gardenNight} style={[styles.art, art, { opacity: sky.night }]} contentFit="cover" />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: WARM_LIGHT, opacity: sky.warmth * 0.16 }]}
        pointerEvents="none"
      />

      {sky.night < 0.6 ? <Butterfly width={width} height={height} opacity={1 - sky.night / 0.6} /> : null}
      {sky.night > 0.3 ? <Fireflies width={width} height={height} opacity={(sky.night - 0.3) / 0.7} /> : null}

      {back.map((p) => p.node)}
      <Animated.View style={[styles.stage, walkStyle]} pointerEvents="box-none">
        {typeof children === 'function' ? children(motion) : children}
      </Animated.View>
      {front.map((p) => p.node)}
      {giftInFlight && newGift && giftSpot && !reduceMotion ? (
        <FlyingGift
          key={newGift}
          source={PROP_SPRITES[newGift].source}
          width={PROP_SPRITES[newGift].width * giftSpot.size * plantScale}
          height={PROP_SPRITES[newGift].height * giftSpot.size * plantScale}
          from={{ x: width / 2 + 40, bottom: 34 + 170 }}
          to={{ x: giftSpot.x * width, bottom: giftSpot.up * meadow + 6 }}
        />
      ) : null}
      {tendAt ? (
        <View style={[styles.tend, { left: tendAt.left, bottom: tendAt.bottom }]} pointerEvents="none">
          <TendSparkle key={tendAt.key} />
        </View>
      ) : null}

      <Svg style={styles.fade} width={width} height={40} pointerEvents="none">
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={fadeTo} stopOpacity={0} />
            <Stop offset="1" stopColor={fadeTo} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={40} fill="url(#fade)" />
      </Svg>
    </View>
  );
}

/** A gift popping out of the dragon's bundle and arcing over to its spot. */
function FlyingGift({
  source,
  width,
  height,
  from,
  to,
}: {
  source: ImageSource;
  width: number;
  height: number;
  from: { x: number; bottom: number };
  to: { x: number; bottom: number };
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(1, { duration: GIFT_FLIGHT_MS, easing: Easing.inOut(Easing.quad) }));
  }, [t]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    const lift = Math.sin(Math.PI * p) * 170;
    return {
      opacity: p < 0.08 ? p / 0.08 : 1,
      transform: [
        { translateX: (from.x - to.x) * (1 - p) },
        { translateY: -((from.bottom - to.bottom) * (1 - p) + lift) },
        { rotate: `${Math.sin(p * Math.PI * 2) * 12}deg` },
        { scale: 0.35 + 0.65 * p },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.plant, { left: to.x - width / 2, bottom: to.bottom }, style]}>
      <Image source={source} style={{ width, height }} contentFit="contain" />
    </Animated.View>
  );
}

/** A few glowing dots drifting over the meadow after dark. */
function Fireflies({ width, height, opacity }: { width: number; height: number; opacity: number }) {
  const flies = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin(i * 45.164 + n * 94.673) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          x: r(1) * width,
          y: height * (0.45 + r(2) * 0.4),
          drift: 10 + r(3) * 18,
          duration: 2200 + r(4) * 2200,
          delay: r(5) * 2000,
        };
      }),
    [width, height],
  );
  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {flies.map((fly, i) => (
        <Firefly key={i} {...fly} />
      ))}
    </View>
  );
}

function Firefly({ x, y, drift, duration, delay }: { x: number; y: number; drift: number; duration: number; delay: number }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [t, duration, delay, reduceMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.25 + t.value * 0.75,
    transform: [{ translateX: t.value * drift }, { translateY: -t.value * drift * 0.6 }],
  }));
  return (
    <Animated.View
      style={[
        styles.firefly,
        { left: x, top: y, backgroundColor: FIREFLY, boxShadow: `0 0 8px 3px ${FIREFLY}` },
        style,
      ]}
    />
  );
}

/** One butterfly wandering a lazy loop over the meadow by day. */
function Butterfly({ width, height, opacity }: { width: number; height: number; opacity: number }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  const flap = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.linear }), -1);
    flap.value = withRepeat(withTiming(0.55, { duration: 160 }), -1, true);
  }, [t, flap, reduceMotion]);
  const style = useAnimatedStyle(() => {
    const a = t.value * Math.PI * 2;
    return {
      transform: [
        { translateX: width * (0.5 + Math.sin(a) * 0.38) },
        { translateY: height * (0.52 + Math.sin(a * 2) * 0.08) },
        { scaleX: flap.value },
      ],
    };
  });
  return (
    <Animated.View style={[styles.butterfly, { opacity }, style]} pointerEvents="none">
      <ThemedText style={styles.butterflyText}>🦋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  art: {
    position: 'absolute',
    bottom: 0,
  },
  plant: {
    position: 'absolute',
  },
  tend: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  stage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 34,
    // Shrinks toward its feet when it walks further back.
    transformOrigin: 'bottom',
  },
  fade: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  firefly: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  butterfly: {
    position: 'absolute',
    left: -12,
    top: -12,
  },
  butterflyText: {
    fontSize: 18,
    lineHeight: 24,
  },
});
