/**
 * Garden decorations sold in the shop. Each has one fixed spot in the meadow,
 * chosen to sit between the plant spots and the journey gifts.
 */

import type { ImageSource } from 'expo-image';

export type DecorId =
  | 'gnome'
  | 'stepping-stones'
  | 'birdhouse'
  | 'wind-chime'
  | 'birdbath'
  | 'campfire'
  | 'fairy-lights'
  | 'swing'
  | 'bridge'
  | 'archway';

/** How a decoration moves on its own. */
export type DecorMotion = 'still' | 'sway' | 'twinkle' | 'flicker';

export type DecorInfo = {
  id: DecorId;
  name: string;
  about: string;
  price: number;
  source: ImageSource;
  /** Lit version, faded in as night falls. */
  night?: ImageSource;
  motion: DecorMotion;
  /** Where it stands: x across the scene, height up the meadow, width in points. */
  spot: { x: number; up: number; width: number };
};

/** In shop order, cheapest first. */
export const DECOR: readonly DecorInfo[] = [
  {
    id: 'gnome',
    name: 'Garden gnome',
    about: 'Keeps an eye on things while everyone is out.',
    price: 40,
    source: require('@/assets/images/decor/gnome.png'),
    motion: 'still',
    spot: { x: 0.26, up: 0.04, width: 42 },
  },
  {
    id: 'stepping-stones',
    name: 'Stepping stones',
    about: 'A little path worn by little feet.',
    price: 50,
    source: require('@/assets/images/decor/stepping-stones.png'),
    motion: 'still',
    spot: { x: 0.66, up: 0.12, width: 70 },
  },
  {
    id: 'birdhouse',
    name: 'Birdhouse',
    about: 'A snug little home for whoever flies by.',
    price: 70,
    source: require('@/assets/images/decor/birdhouse.png'),
    motion: 'still',
    spot: { x: 0.225, up: 0.75, width: 44 },
  },
  {
    id: 'wind-chime',
    name: 'Wind chime',
    about: 'Sways whenever the breeze comes through.',
    price: 80,
    source: require('@/assets/images/decor/wind-chime.png'),
    motion: 'sway',
    spot: { x: 0.79, up: 0.73, width: 42 },
  },
  {
    id: 'birdbath',
    name: 'Birdbath',
    about: 'Cool water for visitors on warm days.',
    price: 90,
    source: require('@/assets/images/decor/birdbath.png'),
    motion: 'still',
    spot: { x: 0.04, up: 0.64, width: 46 },
  },
  {
    id: 'campfire',
    name: 'Campfire',
    about: 'Crackles into life when the sun goes down.',
    price: 110,
    source: require('@/assets/images/decor/campfire.png'),
    night: require('@/assets/images/decor/campfire-night.png'),
    motion: 'flicker',
    spot: { x: 0.635, up: 0.4, width: 52 },
  },
  {
    id: 'fairy-lights',
    name: 'Fairy lights',
    about: 'A string of tiny lights that twinkle after dark.',
    price: 130,
    source: require('@/assets/images/decor/fairy-lights.png'),
    night: require('@/assets/images/decor/fairy-lights-night.png'),
    motion: 'twinkle',
    spot: { x: 0.3, up: 0.86, width: 116 },
  },
  {
    id: 'swing',
    name: 'Garden swing',
    about: 'Rocks gently, waiting for someone to hop on.',
    price: 150,
    source: require('@/assets/images/decor/swing.png'),
    motion: 'sway',
    spot: { x: 0.94, up: 0.97, width: 72 },
  },
  {
    id: 'bridge',
    name: 'Little bridge',
    about: 'It does not go far, but it is a lovely walk.',
    price: 170,
    source: require('@/assets/images/decor/bridge.png'),
    motion: 'still',
    spot: { x: 0.12, up: 0.84, width: 84 },
  },
  {
    id: 'archway',
    name: 'Rose archway',
    about: 'Climbing roses over a garden gate.',
    price: 200,
    source: require('@/assets/images/decor/archway.png'),
    motion: 'still',
    spot: { x: 0.72, up: 0.84, width: 104 },
  },
];

export function isDecorId(id: string): id is DecorId {
  return DECOR.some((item) => item.id === id);
}
