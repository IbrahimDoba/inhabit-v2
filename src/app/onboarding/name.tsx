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
import { GardenBackdrop } from '@/components/garden-backdrop';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { NAME_MAX_LENGTH, randomName } from '@/constants/dragon';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTheme } from '@/hooks/use-theme';

export default function NameScreen() {
  const theme = useTheme();
  const { dragonName, setDragonName } = useOnboarding();
  const [draft, setDraft] = useState(dragonName);
  const [focused, setFocused] = useState(false);
  const name = draft.trim();

  const confirm = () => {
    if (!name) return;
    setDragonName(name);
    router.push('/onboarding/trait');
  };

  return (
    <GardenBackdrop>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.root}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <View style={styles.header}>
              <ThemedText type="title" themeColor="ink" style={styles.center}>
                What will you call your dragon?
              </ThemedText>
            </View>

            <DragonPortrait
              expression="happy"
              accessibilityLabel="Your baby dragon, smiling"
            />

            <View style={styles.form}>
              <View
                style={[
                  styles.field,
                  {
                    backgroundColor: theme.artCard,
                    borderColor: focused ? theme.primary : 'transparent',
                  },
                ]}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onSubmitEditing={confirm}
                  maxLength={NAME_MAX_LENGTH}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="off"
                  returnKeyType="done"
                  placeholder="Name your dragon…"
                  placeholderTextColor={theme.inkSecondary}
                  accessibilityLabel="Dragon name"
                  style={[styles.input, { color: theme.ink }]}
                />
                <Pressable
                  onPress={() => setDraft(randomName(name))}
                  accessibilityRole="button"
                  accessibilityLabel="Suggest another name"
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.shuffle,
                    { backgroundColor: theme.primarySoft },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={styles.shuffleIcon}>🎲</ThemedText>
                </Pressable>
              </View>
              <ThemedText type="small" themeColor="inkSecondary" style={styles.center}>
                You can change this later.
              </ThemedText>
            </View>

          </ScrollView>
          <View style={styles.footer}>
            <PrimaryButton
              label={name ? `Call it ${name}` : 'Pick a name'}
              onPress={confirm}
              disabled={!name}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GardenBackdrop>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  root: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.four,
  },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.five,
  },
  center: {
    textAlign: 'center',
    maxWidth: 340,
    alignSelf: 'center',
  },
  form: {
    gap: Spacing.two,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 2,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.two,
    minHeight: 64,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 24,
    paddingVertical: Spacing.three,
    // The field's own border shows focus; drop the browser outline.
    outlineWidth: 0,
  },
  shuffle: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffleIcon: {
    fontSize: 24,
    lineHeight: 30,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
