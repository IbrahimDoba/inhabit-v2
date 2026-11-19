import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DragonPortrait } from '@/components/dragon-portrait';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { STAGE_RULES, type Stage } from '@/engine/rules';
import { useCloud } from '@/hooks/use-cloud';
import { useTheme } from '@/hooks/use-theme';
import type { SaveSummary } from '@/lib/cloud-save';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function describe(summary: SaveSummary) {
  const stage = STAGE_RULES[summary.stage as Stage]?.label ?? 'Baby';
  const habits = `${summary.habits} ${summary.habits === 1 ? 'habit' : 'habits'}`;
  return `${summary.dragonName} · ${stage} · ${habits}`;
}

function when(time: number | string | null) {
  if (!time) return null;
  return new Date(time).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Optional account: sign in with an emailed code to keep the garden safe in the cloud. */
export default function AccountScreen() {
  const theme = useTheme();
  const cloud = useCloud();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const address = email.trim().toLowerCase();

  const run = async (work: () => Promise<string | null>, after?: () => void) => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    const problem = await work();
    setBusy(false);
    if (problem) setNote(problem);
    else after?.();
  };

  const send = () =>
    run(
      () => cloud.sendCode(address),
      () => setSentTo(address),
    );
  const verify = () =>
    run(
      () => cloud.verifyCode(sentTo ?? address, code.trim()),
      () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCode('');
        setSentTo(null);
      },
    );
  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    run(cloud.deleteAccount, () => setConfirmDelete(false));
  };

  const input = [styles.input, { color: theme.text, backgroundColor: theme.surfaceMuted }];
  const card = [styles.card, { backgroundColor: theme.surface, borderColor: theme.border }];
  const statusLine =
    cloud.status === 'syncing'
      ? 'Saving…'
      : cloud.status === 'offline'
        ? 'Offline. It will save when you are back online.'
        : cloud.status === 'error'
          ? 'The cloud did not answer. It will try again.'
          : cloud.lastSyncedAt
            ? `Saved ${when(cloud.lastSyncedAt)}`
            : 'Not saved yet';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Pressable onPress={close} accessibilityRole="button" hitSlop={8} testID="account-close">
          <ThemedText themeColor="textSecondary">Close</ThemedText>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <DragonPortrait expression={cloud.email ? 'proud' : 'curious'} size={104} />
            <ThemedText type="title" style={styles.center}>
              {cloud.conflict ? 'Two gardens' : cloud.email ? 'Your garden is safe' : 'Save your dragon'}
            </ThemedText>
          </View>

          {!cloud.available ? (
            <ThemedText themeColor="textSecondary" style={styles.center}>
              Accounts are only in the phone app.
            </ThemedText>
          ) : cloud.conflict ? (
            <>
              <ThemedText themeColor="textSecondary" style={styles.center}>
                This phone and your account each hold a garden. Pick the one to keep. The other one is
                replaced.
              </ThemedText>
              <View style={card}>
                <ThemedText type="smallBold">In your account</ThemedText>
                <ThemedText themeColor="textSecondary">{describe(cloud.conflict.cloud)}</ThemedText>
                {cloud.conflict.cloudSavedAt ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Saved {when(cloud.conflict.cloudSavedAt)}
                  </ThemedText>
                ) : null}
                <PrimaryButton
                  label="Keep the account's garden"
                  onPress={() => cloud.resolve('cloud')}
                  testID="keep-cloud"
                />
              </View>
              <View style={card}>
                <ThemedText type="smallBold">On this phone</ThemedText>
                <ThemedText themeColor="textSecondary">{describe(cloud.conflict.phone)}</ThemedText>
                <PrimaryButton
                  label="Keep this phone's garden"
                  onPress={() => cloud.resolve('phone')}
                  testID="keep-phone"
                />
              </View>
            </>
          ) : cloud.email ? (
            <>
              <View style={card}>
                <ThemedText type="smallBold">{cloud.email}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" testID="account-status">
                  {statusLine}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Your garden saves by itself after every change. Sign in with this email on a new phone to
                  bring it back.
                </ThemedText>
                <Pressable
                  onPress={cloud.syncNow}
                  accessibilityRole="button"
                  testID="account-sync"
                  style={[styles.quiet, { backgroundColor: theme.surfaceMuted }]}>
                  <ThemedText type="smallBold" themeColor="primary">
                    Save now
                  </ThemedText>
                </Pressable>
              </View>

              <Pressable
                onPress={() => run(async () => (await cloud.signOut(), null))}
                accessibilityRole="button"
                testID="account-signout"
                style={[styles.quiet, { backgroundColor: theme.surfaceMuted }]}>
                <ThemedText type="smallBold">Sign out</ThemedText>
              </Pressable>
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                Signing out keeps the garden on this phone.
              </ThemedText>

              <Pressable
                onPress={remove}
                accessibilityRole="button"
                testID="account-delete"
                style={[styles.quiet, { backgroundColor: confirmDelete ? theme.danger : theme.surfaceMuted }]}>
                <ThemedText type="smallBold" style={{ color: confirmDelete ? theme.onPrimary : theme.danger }}>
                  {confirmDelete ? 'Tap again to delete the account' : 'Delete account'}
                </ThemedText>
              </Pressable>
              <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                Deletes your email and the cloud copy for good. The garden on this phone stays.
              </ThemedText>
            </>
          ) : sentTo ? (
            <>
              <ThemedText themeColor="textSecondary" style={styles.center}>
                We sent a 6-digit code to {sentTo}. It works for 10 minutes.
              </ThemedText>
              <TextInput
                key="code"
                value={code}
                onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
                onSubmitEditing={verify}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                placeholder="123456"
                placeholderTextColor={theme.textSecondary}
                accessibilityLabel="Sign-in code"
                testID="account-code"
                autoFocus
                style={[input, styles.code]}
              />
              <PrimaryButton
                label={busy ? 'One moment…' : 'Sign in'}
                disabled={busy || code.length !== 6}
                onPress={verify}
                testID="account-verify"
              />
              <Pressable
                onPress={() => {
                  setSentTo(null);
                  setCode('');
                  setNote(null);
                }}
                accessibilityRole="button"
                hitSlop={8}>
                <ThemedText type="small" themeColor="primary" style={styles.center}>
                  Use a different email
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <>
              <ThemedText themeColor="textSecondary" style={styles.center}>
                Add your email and your garden is copied to the cloud, ready to come back on a new phone.
                No password. It is optional, and you can delete it any time.
              </ThemedText>
              <TextInput
                key="email"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={send}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                accessibilityLabel="Email"
                testID="account-email"
                style={input}
              />
              <PrimaryButton
                label={busy ? 'One moment…' : 'Email me a code'}
                disabled={busy || !EMAIL.test(address)}
                onPress={send}
                testID="account-send"
              />
            </>
          )}

          {note ? (
            <ThemedText type="small" themeColor="danger" style={styles.center} testID="account-note">
              {note}
            </ThemedText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: Spacing.two,
  },
  input: {
    minHeight: 52,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.body,
    fontSize: 18,
    // Stated, not left to the default: iOS otherwise carries the code field's spacing over.
    letterSpacing: 0,
  },
  code: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    letterSpacing: 6,
    textAlign: 'center',
  },
  quiet: {
    minHeight: 48,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});
