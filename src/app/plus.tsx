import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonPortrait } from '@/components/dragon-portrait';
import { IconPebble } from '@/components/icon';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { PLUS_PERKS, PRIVACY_URL, TERMS_URL } from '@/constants/plus';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { usePlus } from '@/hooks/use-plus';
import { useTheme } from '@/hooks/use-theme';

/** The Inhabit Plus page: what it gives, the plans, and restoring a past purchase. */
export default function PlusScreen() {
  const theme = useTheme();
  const { dragonName } = useOnboarding();
  const { isPlus, available, plans, buy, restore } = usePlus();
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const plan = plans?.find((p) => p.id === picked) ?? plans?.[0] ?? null;

  const subscribe = async () => {
    if (!plan || busy) return;
    setBusy(true);
    setNote(null);
    try {
      if (await buy(plan)) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setNote('That did not go through. Nothing was charged. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const restorePast = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      setNote((await restore()) ? null : 'No past purchase was found for this Apple ID.');
    } catch {
      setNote('Could not reach the store. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Pressable onPress={close} accessibilityRole="button" hitSlop={8} testID="plus-close">
          <ThemedText themeColor="textSecondary">Close</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <DragonPortrait expression={isPlus ? 'proud' : 'happy'} size={112} />
          <ThemedText type="title" style={styles.center}>
            {isPlus ? 'You have Inhabit Plus' : 'Inhabit Plus'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.center}>
            {isPlus
              ? `Thank you. ${dragonName} noticed.`
              : `A little extra for you and ${dragonName}. Everything you have stays free.`}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {PLUS_PERKS.map((perk) => (
            <View key={perk.title} style={styles.perk}>
              <IconPebble emoji={perk.emoji} size={48} />
              <View style={styles.perkText}>
                <ThemedText type="smallBold">{perk.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {perk.detail}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {isPlus ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            Manage or cancel any time in your App Store subscriptions.
          </ThemedText>
        ) : !available ? (
          <ThemedText themeColor="textSecondary" style={styles.center} testID="plus-unavailable">
            Plus is not on sale in this build yet.
          </ThemedText>
        ) : plans === null ? (
          <ActivityIndicator color={theme.primary} />
        ) : plans.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.center}>
            The store has no plans to show right now. Please try again later.
          </ThemedText>
        ) : (
          <>
            <View style={styles.plans}>
              {plans.map((p) => {
                const selected = p.id === plan?.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPicked(p.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    testID={`plan-${p.id}`}
                    style={[
                      styles.plan,
                      {
                        backgroundColor: selected ? theme.primarySoft : theme.surface,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}>
                    <View style={styles.perkText}>
                      <ThemedText type="smallBold">{p.title}</ThemedText>
                      {p.offer ? (
                        <ThemedText type="small" themeColor="primary">
                          {p.offer}
                        </ThemedText>
                      ) : null}
                    </View>
                    <ThemedText type="smallBold">
                      {p.price} {p.period}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <PrimaryButton
              label={busy ? 'One moment…' : 'Continue'}
              disabled={busy || !plan}
              onPress={subscribe}
              testID="plus-buy"
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              Renews automatically until cancelled. Cancel any time in your App Store subscriptions.
            </ThemedText>
          </>
        )}

        {note ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {note}
          </ThemedText>
        ) : null}

        <View style={styles.links}>
          {available && !isPlus ? (
            <Pressable onPress={restorePast} accessibilityRole="button" hitSlop={8} testID="plus-restore">
              <ThemedText type="small" themeColor="primary">
                Restore purchases
              </ThemedText>
            </Pressable>
          ) : null}
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link" hitSlop={8}>
            <ThemedText type="small" themeColor="primary">
              Terms
            </ThemedText>
          </Pressable>
          {PRIVACY_URL ? (
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link" hitSlop={8}>
              <ThemedText type="small" themeColor="primary">
                Privacy
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  perkText: {
    flex: 1,
    gap: Spacing.half,
  },
  plans: {
    gap: Spacing.two,
  },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 2,
    padding: Spacing.three,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
});
