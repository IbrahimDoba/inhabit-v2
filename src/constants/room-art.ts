/** Pictures for the den's furniture, and where each slot stands in the room. */

import type { ImageSource } from 'expo-image';

import type { RoomItemId, RoomSlot } from '@/lib/room';

export const ROOM_ART: Record<RoomItemId, { source: ImageSource; night?: ImageSource }> = {
  bed: { source: require('@/assets/images/house/bed.png') },
  'bed-cloud': { source: require('@/assets/images/house/bed-cloud.png') },
  rug: { source: require('@/assets/images/house/rug.png') },
  'rug-star': { source: require('@/assets/images/house/rug-star.png') },
  lamp: {
    source: require('@/assets/images/house/lamp.png'),
    night: require('@/assets/images/house/lamp-night.png'),
  },
  'lamp-mushroom': {
    source: require('@/assets/images/house/lamp-mushroom.png'),
    night: require('@/assets/images/house/lamp-mushroom-night.png'),
  },
  bookshelf: { source: require('@/assets/images/house/bookshelf.png') },
  'toy-chest': { source: require('@/assets/images/house/toy-chest.png') },
  'plant-pot': { source: require('@/assets/images/house/plant-pot.png') },
  'wall-picture': { source: require('@/assets/images/house/wall-picture.png') },
  clock: { source: require('@/assets/images/house/clock.png') },
  cushion: { source: require('@/assets/images/house/cushion.png') },
};

/**
 * Each slot's box as fractions of the room picture: left edge, bottom edge,
 * width and height. Listed back to front, the order they are drawn in.
 * `front` pieces draw over the dragon.
 */
export const ROOM_SLOTS: readonly {
  slot: RoomSlot;
  left: number;
  bottom: number;
  width: number;
  height: number;
  front?: boolean;
}[] = [
  { slot: 'picture', left: 0.42, bottom: 0.6, width: 0.17, height: 0.17 },
  { slot: 'clock', left: 0.7, bottom: 0.62, width: 0.12, height: 0.13 },
  { slot: 'shelf', left: 0.03, bottom: 0.33, width: 0.2, height: 0.22 },
  { slot: 'lamp', left: 0.77, bottom: 0.28, width: 0.18, height: 0.24 },
  { slot: 'rug', left: 0.11, bottom: 0.025, width: 0.78, height: 0.24 },
  { slot: 'bed', left: 0.17, bottom: 0.1, width: 0.66, height: 0.343 },
  { slot: 'chest', left: 0.02, bottom: 0.1, width: 0.2, height: 0.17, front: true },
  { slot: 'pot', left: 0.83, bottom: 0.05, width: 0.14, height: 0.2, front: true },
  { slot: 'cushion', left: 0.2, bottom: 0.02, width: 0.17, height: 0.1, front: true },
];
