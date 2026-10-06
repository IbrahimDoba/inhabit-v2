import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useQuests } from '@/hooks/use-quests';
import { useTheme } from '@/hooks/use-theme';
import { useWidgetSync } from '@/hooks/use-widget-sync';

export default function TabsLayout() {
  const theme = useTheme();
  const { claimable } = useQuests();
  useWidgetSync();

  return (
    <NativeTabs
      tintColor={theme.primary}
      indicatorColor={theme.primarySoft}
      rippleColor={theme.primarySoft}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="quests">
        <NativeTabs.Trigger.Label>Quests</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'flag', selected: 'flag.fill' }} md="flag" />
        {/* Rendered only when needed: the web build ignores `hidden`. */}
        {claimable > 0 ? <NativeTabs.Trigger.Badge>{String(claimable)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shop">
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="friends">
        <NativeTabs.Trigger.Label>Friends</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          md="group"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="companion">
        <NativeTabs.Trigger.Label>Companion</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'pawprint', selected: 'pawprint.fill' }}
          md="pets"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
