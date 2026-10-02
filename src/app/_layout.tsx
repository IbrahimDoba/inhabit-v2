import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka/700Bold';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CompanionProvider } from '@/hooks/use-companion';
import { HabitsProvider } from '@/hooks/use-habits';
import { SkyProvider } from '@/hooks/use-sky';
import { StatusBarProvider, useStatusBarOverride } from '@/hooks/use-status-bar';
import { OnboardingProvider, useOnboarding } from '@/hooks/use-onboarding';

// Keep the splash up until the fonts are ready, so text never jumps between faces.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  // A failed font load falls back to the system font rather than blocking the app.
  if (!ready) return null;

  return (
    <OnboardingProvider>
      <CompanionProvider>
        <HabitsProvider>
          <SkyProvider>
            <StatusBarProvider>
              <RootNavigator />
            </StatusBarProvider>
          </SkyProvider>
        </HabitsProvider>
      </CompanionProvider>
    </OnboardingProvider>
  );
}

function RootNavigator() {
  const { isComplete } = useOnboarding();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { override } = useStatusBarOverride();
  const palette = isDark ? Colors.dark : Colors.light;
  const base = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isComplete}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={isComplete}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="habit/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="plant/[id]" options={{ presentation: 'modal' }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style={override ?? (isDark ? 'light' : 'dark')} />
    </ThemeProvider>
  );
}
