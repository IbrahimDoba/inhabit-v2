import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonSprite } from '@/components/dragon-sprite';
import { PrimaryButton } from '@/components/primary-button';
import { SunRays } from '@/components/sun-rays';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HomecomingMomentProps = {
  visible: boolean;
  name: string;
  story: string;
  diamonds: number;
  welcomeBonus: number;
  giftName: string;
  onCollect: () => void;
};

/** The dragon walks home, tells its story, and hands over its diamonds and gift. */
export function HomecomingMoment(props: HomecomingMomentProps) {
  return (
    <Modal
      visible={props.visible}
      animationType="fade"
      onRequestClose={props.onCollect}
      statusBarTranslucent>
      {props.visible ? <Content {...props} /> : null}
    </Modal>
  );
}

function Content({ name, story, diamonds, welcomeBonus, giftName, onCollect }: HomecomingMomentProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const walk = useSharedValue(reduceMotion ? 0 : 1);
  const spin = useSharedValue(0);
  // Walks in with its bundle, then settles into its idle loop.
  const [arrived, setArrived] = useState(reduceMotion);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (reduceMotion) return;
    const settle = setTimeout(() => setArrived(true), 1400);
    walk.value = withTiming(0, { duration: 1300, easing: Easing.out(Easing.quad) });
    spin.value = withRepeat(withTiming(1, { duration: 30000, easing: Easing.linear }), -1);
    return () => clearTimeout(settle);
  }, [walk, spin, reduceMotion]);

  const dragonStyle = useAnimatedStyle(() => ({
    opacity: 1 - walk.value * 0.8,
    transform: [{ translateX: walk.value * -240 }],
  }));
  const raysStyle = useAnimatedStyle(() => ({
    opacity: 1 - walk.value,
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const tripDiamonds = diamonds - welcomeBonus;

  return (
    <View style={[styles.root, { backgroundColor: theme.momentDark }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <Animated.View entering={FadeIn.duration(400)}>
            <ThemedText type="title" style={[styles.center, { color: theme.onMoment }]}>
              {name} is back!
            </ThemedText>
          </Animated.View>

          <View style={styles.stage}>
            <Animated.View style={[styles.rays, raysStyle]} pointerEvents="none">
              <SunRays />
            </Animated.View>
            <Animated.View style={dragonStyle}>
              <DragonSprite pose={arrived ? 'idle' : 'walk'} height={175} />
            </Animated.View>
          </View>

          <Animated.View
            entering={FadeInDown.delay(1100).duration(450)}
            style={[styles.story, { backgroundColor: theme.bubble }]}>
            <ThemedText type="smallBold" themeColor="inkSecondary" style={styles.eyebrow}>
              TODAY&apos;S ADVENTURE
            </ThemedText>
            <ThemedText themeColor="ink" style={styles.storyText}>
              {story}
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(1600).duration(400)} style={styles.rewards}>
            <Reward emoji="💎" label={`+${tripDiamonds} diamonds`} />
            {welcomeBonus > 0 ? (
              <Reward emoji="🎁" label={`+${welcomeBonus} welcome bonus for your first adventure`} />
            ) : null}
            <Reward emoji="🌱" label={`${capitalise(giftName)} for your garden`} />
          </Animated.View>
        </ScrollView>

        <Animated.View entering={FadeIn.delay(2000).duration(400)} style={styles.footer}>
          <PrimaryButton variant="onMoment" label="Collect" onPress={onCollect} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

function Reward({ emoji, label }: { emoji: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.reward, { backgroundColor: theme.momentCard }]}>
      <ThemedText style={styles.rewardEmoji}>{emoji}</ThemedText>
      <ThemedText type="smallBold" style={[styles.rewardLabel, { color: theme.onMoment }]}>
        {label}
      </ThemedText>
    </View>
  );
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  center: {
    textAlign: 'center',
  },
  stage: {
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rays: {
    position: 'absolute',
    width: 400,
    height: 400,
    top: 90 - 200,
    left: 110 - 200,
  },
  story: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    padding: Spacing.four,
    gap: Spacing.two,
    transform: [{ rotate: '-1deg' }],
  },
  eyebrow: {
    letterSpacing: 1.5,
  },
  storyText: {
    fontSize: 17,
    lineHeight: 25,
  },
  rewards: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  rewardEmoji: {
    fontSize: 20,
    lineHeight: 26,
  },
  rewardLabel: {
    flex: 1,
  },
  footer: {
    paddingBottom: Spacing.three,
  },
});
