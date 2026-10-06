import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Expressions, type Expression } from '@/constants/dragon';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ToastMessage = { title: string; subtitle?: string; expression?: Expression };

const SHOW_MS = 1900;

/** A queue of small messages with the dragon's face. One shows at a time. */
export function useToasts() {
  const [queue, setQueue] = useState<(ToastMessage & { id: number })[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: ToastMessage) => {
    setQueue((q) => [...q, { ...message, id: nextId.current++ }]);
  }, []);

  const current = queue[0] ?? null;

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => clearTimeout(timer);
  }, [current]);

  return { show, current };
}

export function Toast({ message }: { message: (ToastMessage & { id: number }) | null }) {
  const theme = useTheme();
  if (!message) return null;

  return (
    <Animated.View
      key={message.id}
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.toast, { backgroundColor: theme.momentDark }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={[message.title, message.subtitle].filter(Boolean).join('. ')}>
      <View style={[styles.face, { backgroundColor: theme.primarySoft }]}>
        <Image
          source={Expressions[message.expression ?? 'happy']}
          style={styles.faceImage}
          contentFit="cover"
          contentPosition="top"
        />
      </View>
      <View style={styles.text}>
        <ThemedText type="smallBold" style={{ color: theme.onMoment }}>
          {message.title}
        </ThemedText>
        {message.subtitle ? (
          <ThemedText type="small" style={{ color: theme.onMomentMuted }}>
            {message.subtitle}
          </ThemedText>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
  },
  face: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  faceImage: {
    width: 40,
    height: 46,
  },
  text: {
    flex: 1,
  },
});
