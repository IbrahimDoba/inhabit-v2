// Generated with the garden gift art: each prop sprite and its size in points.

import type { ImageSource } from 'expo-image';

import type { PropId } from '@/engine/rules';

export type PropSprite = { source: ImageSource; width: number; height: number };

export const PROP_SPRITES: Record<PropId, PropSprite> = {
  flowers: { source: require('@/assets/images/props/flowers.png'), width: 53, height: 49 },
  stones: { source: require('@/assets/images/props/stones.png'), width: 56, height: 29 },
  mushrooms: { source: require('@/assets/images/props/mushrooms.png'), width: 48, height: 45 },
  lantern: { source: require('@/assets/images/props/lantern.png'), width: 41, height: 55 },
  bench: { source: require('@/assets/images/props/bench.png'), width: 56, height: 42 },
  fence: { source: require('@/assets/images/props/fence.png'), width: 47, height: 42 },
  pond: { source: require('@/assets/images/props/pond.png'), width: 55, height: 28 },
};
