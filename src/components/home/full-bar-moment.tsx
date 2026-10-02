import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonSprite } from '@/components/dragon-sprite';
import { Confetti } from '@/components/home/confetti';
import { PrimaryButton } from '@/components/primary-button';
import { SunRays } from '@/components/sun-rays';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { STAGE_RULES, type Stage } from '@/engine/rules';
import { useTheme } from '@/hooks/use-theme';

type FullBarMomentProps = {
  visible: boolean;
  name: string;
  stage: Stage;
  stageDays: number;
  grewUp: { from: Stage; to: Stage } | null;
  canExplore: boolean;
  onExplore: () => void;
  onClose: () => void;
};

/** Whole-screen celebration when today's bar fills. Offers the journey. */
export function FullBarMoment({
  visible,
  name,
  stage,
  stageDays,
  grewUp,
  canExplore,
  onExplore,
  onClose,
}: FullBarMomentProps) {
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {visible ? (
        <Content
          name={name}
          stage={stage}
          stageDays={stageDays}
          grewUp={grewUp}
          canExplore={canExplore}
          onExplore={onExplore}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function Content({
  name,
  stage,
  stageDays,
  grewUp,
  canExplore,
  onExplore,
  onClose,
}: Omit<FullBarMomentProps, 'visible'>) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(0);
  const bounce = useSharedValue(0);
  const rules = STAGE_RULES[stage];
  const needed = rules.daysToGrow;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (reduceMotion) return;
    spin.value = withRepeat(withTiming(1, { duration: 24000, easing: Easing.linear }), -1);
    bounce.value = withDelay(
      200,
      withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 6, stiffness: 160 }),
      ),
    );
  }, [spin, bounce, reduceMotion]);

  const raysStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const dragonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -bounce.value * 40 }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: theme.momentBright }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <View style={styles.stage}>
            <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
              <SunRays />
            </Animated.View>
            <Confetti burstKey={1} count={36} />
            <Animated.View style={dragonStyle}>
              <DragonSprite height={200} />
            </Animated.View>
          </View>

          <Animated.View entering={FadeIn.delay(250).duration(400)} style={styles.titles}>
            <ThemedText type="title" style={[styles.center, { color: theme.onMoment }]}>
              Woohoo!
            </ThemedText>
            <ThemedText style={[styles.center, { color: theme.onMoment }]}>
              {name} is full of energy for today.
            </ThemedText>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(400)}
            style={[styles.card, { backgroundColor: theme.bubble }]}>
            {grewUp ? (
              <>
                <ThemedText style={styles.cardEmoji}>🎉</ThemedText>
                <ThemedText type="subtitle" themeColor="ink" style={styles.center}>
                  {name} grew into a {STAGE_RULES[grewUp.to].label.toLowerCase()} dragon!
                </ThemedText>
              </>
            ) : needed === null ? (
              <ThemedText type="smallBold" themeColor="ink" style={styles.center}>
                {name} is all grown up. Every full day still counts.
              </ThemedText>
            ) : (
              <>
                <ThemedText type="smallBold" themeColor="ink">
                  {name} is growing up a little
                </ThemedText>
                <View style={[styles.track, { backgroundColor: theme.primarySoft }]}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${(stageDays / needed) * 100}%`, backgroundColor: theme.gold },
                    ]}
                  />
                </View>
                <ThemedText type="small" themeColor="inkSecondary">
                  {stageDays} of {needed} full-care days ·{' '}
                  {needed - stageDays === 1
                    ? 'one more to grow up!'
                    : `${needed - stageDays} more to grow up`}
                </ThemedText>
              </>
            )}
          </Animated.View>
        </ScrollView>

        <Animated.View entering={FadeIn.delay(900).duration(400)} style={styles.footer}>
          {canExplore ? (
            <>
              <ThemedText style={[styles.center, { color: theme.onMomentMuted }]}>
                {name} is ready to go exploring and bring something back.
              </ThemedText>
              <PrimaryButton variant="onMoment" label={`Send ${name} exploring`} onPress={onExplore} />
              <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
                <ThemedText type="smallBold" style={[styles.center, { color: theme.onMoment }]}>
                  Later
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <PrimaryButton variant="onMoment" label="Yay!" onPress={onClose} />
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  stage: {
    width: 240,
    height: 220,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rays: {
    position: 'absolute',
    width: 440,
    height: 440,
    top: 110 - 220,
    left: 120 - 220,
  },
  titles: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    padding: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
    lineHeight: 40,
  },
  track: {
    alignSelf: 'stretch',
    height: 12,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  footer: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
