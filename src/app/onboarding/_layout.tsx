import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { ColorSchemeOverride } from '@/hooks/use-theme';

export default function OnboardingLayout() {
  return (
    // Onboarding sits on light artwork in both colour schemes.
    <ColorSchemeOverride.Provider value="light">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: Colors.light.background },
        }}
      />
      <StatusBar style="dark" />
    </ColorSchemeOverride.Provider>
  );
}
