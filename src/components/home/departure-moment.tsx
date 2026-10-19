import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DragonSprite, lookForStage } from '@/components/dragon-sprite';
import { JourneyCard } from '@/components/home/journey-card';
import { PrimaryButton } from '@/components/primary-button';
import { TrailScene } from '@/components/scene/trail-scene';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import type { Stage } from '@/engine/rules';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import type { SkyState } from '@/lib/sky';

type DepartureMomentProps = {
  visible: boolean;
  name: string;
  stage: Stage;
  sky: SkyState;
  /** Colour under the scene, matching Home's panel. */
  panel: string;
  startedAt: number;
  returnsAt: number;
  onClose: () => void;
};

/**
 * The send-off: the whole screen becomes the trail, the dragon sets out with its
 * stick and bundle while the land rolls past, and the countdown starts ticking.
 */
export function DepartureMoment({ visible, onClose, ...rest }: DepartureMomentProps) {
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {visible ? <Content onClose={onClose} {...rest} /> : null}
    </Modal>
  );
}

function Content({
  name,
  stage,
  sky,
  panel,
  startedAt,
  returnsAt,
  onClose,
}: Omit<DepartureMomentProps, 'visible'>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const now = useNow();
  const sceneHeight = Math.round(Math.min(window.height * 0.6, window.width * 1.3));
  const span = Math.max(returnsAt - startedAt, 1);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: panel }]}>
      <TrailScene
        sky={sky}
        width={window.width}
        height={sceneHeight}
        fadeTo={panel}
        topInset={insets.top}>
        <DragonSprite
          pose="walk"
          look={lookForStage(stage)}
          height={stage === 'baby' ? 200 : 230}
        />
      </TrailScene>

      <View style={[styles.body, { paddingBottom: insets.bottom + Spacing.four }]}>
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.titles}>
          <ThemedText type="subtitle" themeColor="ink" style={styles.center}>
            {name} set off exploring!
          </ThemedText>
          <ThemedText themeColor="inkSecondary" style={styles.center}>
            They will be back with a story and a surprise for your garden.
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(550).duration(400)}
          style={[styles.card, { backgroundColor: theme.artCard }]}>
          <JourneyCard
            petName={name}
            remainingMs={returnsAt - now}
            progress={Math.min(Math.max((now - startedAt) / span, 0), 1)}
          />
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View entering={FadeIn.delay(1200).duration(500)}>
          <PrimaryButton label="Got it!" onPress={onClose} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  titles: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Radii.lg,
    padding: Spacing.four,
  },
  spacer: {
    flex: 1,
  },
});
