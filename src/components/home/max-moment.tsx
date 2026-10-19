import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Confetti } from '@/components/home/confetti';
import type { Point } from '@/components/home/energy-bolts';
import { PrimaryButton } from '@/components/primary-button';
import { IconPebble } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { STAGE_RULES, type Stage } from '@/engine/rules';
import { useTheme } from '@/hooks/use-theme';

type MaxMomentProps = {
  name: string;
  stage: Stage;
  stageDays: number;
  grewUp: { from: Stage; to: Stage } | null;
  /** Diamonds the full bar paid, flown into the counter. */
  diamonds: number;
  canExplore: boolean;
  /** Where the overlay starts: just under the dragon's feet. */
  top: number;
  bottomInset: number;
  /** Home's panel colour, so the overlay melts into the scene. */
  panel: string;
  /** The moment is on screen: the dragon can hop. */
  onShown: () => void;
  /** The reward chip is up; fly diamonds from this point (window coordinates). */
  onReward: (from: Point) => void;
  onExplore: () => void;
  onClose: () => void;
};

const FADE = 36;

/**
 * The full bar, Finch-style, without leaving Home: the list fades away under the
 * garden, the bar takes centre stage and turns MAX, and the day's diamonds fly into
 * the counter. Continue shows how close the dragon is to growing up and offers the journey.
 */
export function MaxMoment({
  name,
  stage,
  stageDays,
  grewUp,
  diamonds,
  canExplore,
  top,
  bottomInset,
  panel,
  onShown,
  onReward,
  onExplore,
  onClose,
}: MaxMomentProps) {
  const theme = useTheme();
  const [phase, setPhase] = useState<'max' | 'next'>('max');
  const chipRef = useRef<View>(null);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onShown();
    // Fly the diamonds once the chip has slid in.
    const timer = setTimeout(() => {
      chipRef.current?.measureInWindow((x, y, w, h) => onReward({ x: x + 22, y: y + h / 2 }));
    }, 1000);
    return () => clearTimeout(timer);
    // Once per moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      exiting={FadeOut.duration(250)}
      style={[styles.root, { top: top - FADE }]}>
      <Svg width="100%" height={FADE} pointerEvents="none">
        <Defs>
          <LinearGradient id="maxFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={panel} stopOpacity={0} />
            <Stop offset="1" stopColor={panel} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height={FADE} fill="url(#maxFade)" />
      </Svg>

      <View style={[styles.panel, { backgroundColor: panel }]}>
        <View style={styles.confetti} pointerEvents="none">
          <Confetti burstKey={7} count={40} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomInset + Spacing.three }]}
          bounces={false}>
          {phase === 'max' ? (
            <>
              <MaxBar />
              <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.titles}>
                <ThemedText type="title" themeColor="ink" style={styles.center}>
                  Woohoo!
                </ThemedText>
                <ThemedText themeColor="inkSecondary" style={styles.center}>
                  {name} is full of energy for today.
                </ThemedText>
              </Animated.View>
              {diamonds > 0 ? (
                <Animated.View entering={FadeInDown.delay(750).duration(400)}>
                  <View ref={chipRef} style={[styles.chip, { backgroundColor: theme.artCard }]}>
                    <IconPebble emoji="💎" size={40} />
                    <View>
                      <ThemedText type="small" themeColor="inkSecondary">
                        {name} got
                      </ThemedText>
                      <ThemedText type="smallBold" themeColor="ink">
                        +{diamonds} diamonds
                      </ThemedText>
                    </View>
                  </View>
                </Animated.View>
              ) : null}
              <View style={styles.spacer} />
              <Animated.View entering={FadeIn.delay(1300).duration(400)} style={styles.actions}>
                <PrimaryButton label="Continue" onPress={() => setPhase('next')} />
              </Animated.View>
            </>
          ) : (
            <>
              <Animated.View
                entering={FadeInDown.duration(350)}
                style={[styles.card, { backgroundColor: theme.artCard }]}>
                <Growth name={name} stage={stage} stageDays={stageDays} grewUp={grewUp} />
              </Animated.View>
              <View style={styles.spacer} />
              <Animated.View entering={FadeIn.delay(200).duration(350)} style={styles.actions}>
                {canExplore ? (
                  <>
                    <ThemedText themeColor="inkSecondary" style={styles.center}>
                      {name} is ready to go exploring and bring something back.
                    </ThemedText>
                    <PrimaryButton label={`Send ${name} exploring`} onPress={onExplore} />
                    <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
                      <ThemedText type="smallBold" themeColor="primary" style={styles.center}>
                        Later
                      </ThemedText>
                    </Pressable>
                  </>
                ) : (
                  <PrimaryButton label="Yay!" onPress={onClose} />
                )}
              </Animated.View>
            </>
          )}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

/** The energy bar, filled to the brim: the last stretch fills, MAX lands, the bolt badge pops. */
function MaxBar() {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(reduceMotion ? 1 : 0.7);
  const badge = useSharedValue(reduceMotion ? 1 : 0);
  const label = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    fill.set(withDelay(150, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })));
    label.set(withDelay(550, withTiming(1, { duration: 250 })));
    badge.set(
      withDelay(550, withSequence(withSpring(1.35, { damping: 6 }), withSpring(1, { damping: 9 }))),
    );
  }, [fill, badge, label, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badge.get() }] }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: label.get(),
    transform: [{ scale: 0.6 + label.get() * 0.4 }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.barRow}
      accessibilityRole="progressbar"
      accessibilityLabel="Energy full">
      <View style={[styles.track, { backgroundColor: theme.primarySoft }]}>
        <Animated.View style={[styles.fill, { backgroundColor: theme.gold }, fillStyle]} />
        <Animated.View style={[styles.maxLabel, labelStyle]}>
          <ThemedText type="smallBold" themeColor="ink" style={styles.maxText}>
            MAX
          </ThemedText>
        </Animated.View>
      </View>
      <Animated.View
        style={[
          styles.badge,
          { backgroundColor: theme.gold, borderColor: theme.bubble },
          badgeStyle,
        ]}>
        <ThemedText style={styles.badgeIcon}>⚡</ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

function Growth({
  name,
  stage,
  stageDays,
  grewUp,
}: Pick<MaxMomentProps, 'name' | 'stage' | 'stageDays' | 'grewUp'>) {
  const theme = useTheme();
  const needed = STAGE_RULES[stage].daysToGrow;

  if (grewUp) {
    return (
      <>
        <IconPebble emoji="🎉" size={60} />
        <ThemedText type="subtitle" themeColor="ink" style={styles.center}>
          {name} grew into a {STAGE_RULES[grewUp.to].label.toLowerCase()} dragon!
        </ThemedText>
      </>
    );
  }
  if (needed === null) {
    return (
      <ThemedText type="smallBold" themeColor="ink" style={styles.center}>
        {name} is all grown up. Every full day still counts.
      </ThemedText>
    );
  }
  return (
    <>
      <ThemedText type="smallBold" themeColor="ink">
        {name} is growing up a little
      </ThemedText>
      <View style={[styles.growTrack, { backgroundColor: theme.primarySoft }]}>
        <View
          style={[
            styles.growFill,
            { width: `${(stageDays / needed) * 100}%`, backgroundColor: theme.gold },
          ]}
        />
      </View>
      <ThemedText type="small" themeColor="inkSecondary" style={styles.center}>
        {stageDays} of {needed} full-care days ·{' '}
        {needed - stageDays === 1
          ? 'one more to grow up!'
          : `${needed - stageDays} more to grow up`}
      </ThemedText>
    </>
  );
}

const BADGE = 40;

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    flex: 1,
  },
  confetti: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -40,
    height: 120,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.four,
  },
  track: {
    flex: 1,
    height: 22,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radii.pill,
  },
  maxLabel: {
    alignItems: 'center',
  },
  maxText: {
    letterSpacing: 1,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 3,
    marginLeft: -BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 20,
    lineHeight: 26,
  },
  titles: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
  chip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: Radii.lg,
    padding: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  growTrack: {
    alignSelf: 'stretch',
    height: 12,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  growFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
});
