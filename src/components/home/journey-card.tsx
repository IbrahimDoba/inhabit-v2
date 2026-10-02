import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Expressions } from '@/constants/dragon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function formatCountdown(ms: number) {
  const total = Math.max(Math.ceil(ms / 1000), 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type JourneyCardProps = {
  petName: string;
  remainingMs: number;
  /** 0 at departure, 1 on return. */
  progress: number;
};

/** Shown instead of the energy bar while the dragon is away. */
export function JourneyCard({ petName, remainingMs, progress }: JourneyCardProps) {
  const theme = useTheme();
  const countdown = formatCountdown(remainingMs);

  return (
    <View
      style={styles.root}
      accessible
      accessibilityLabel={`${petName} is exploring, back in ${countdown}`}>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="ink">
          🎒 Exploring
        </ThemedText>
        <ThemedText type="smallBold" themeColor="inkSecondary" style={styles.time}>
          back in {countdown}
        </ThemedText>
      </View>
      <View style={styles.track}>
        <View style={[styles.dots, { borderColor: theme.primary }]} />
        <View style={[styles.home, { backgroundColor: theme.gold }]}>
          <ThemedText style={styles.small}>🏡</ThemedText>
        </View>
        <View
          style={[
            styles.token,
            {
              left: `${8 + progress * 76}%`,
              backgroundColor: theme.primarySoft,
              borderColor: theme.bubble,
            },
          ]}>
          <Image
            source={Expressions.happy}
            style={styles.tokenImage}
            contentFit="cover"
            contentPosition="top"
          />
        </View>
        <View style={[styles.goal, { backgroundColor: theme.gold }]}>
          <ThemedText type="smallBold" themeColor="ink">
            ?
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const TOKEN = 30;

const styles = StyleSheet.create({
  root: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: TOKEN,
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    left: TOKEN / 2,
    right: TOKEN / 2,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  home: {
    position: 'absolute',
    left: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  token: {
    position: 'absolute',
    width: TOKEN,
    height: TOKEN,
    marginLeft: -TOKEN / 2,
    borderRadius: TOKEN / 2,
    overflow: 'hidden',
    borderWidth: 2,
  },
  tokenImage: {
    width: TOKEN,
    height: TOKEN * 1.15,
  },
  goal: {
    position: 'absolute',
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
