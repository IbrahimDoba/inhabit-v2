/**
 * The plant types a habit can grow as. Each carries a meaning, in the spirit of
 * the old language of flowers, so choosing one says something about the habit.
 * Starters are free; the rest are bought as seeds in the shop with diamonds.
 */

import type { PlantSpecies } from '@/constants/plant-sprites';

export type PlantInfo = {
  id: PlantSpecies;
  name: string;
  emoji: string;
  meaning: string;
  about: string;
  /** Diamonds in the shop; 0 for starter plants everyone has. */
  price: number;
};

export const PLANTS: Record<PlantSpecies, PlantInfo> = {
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    meaning: 'Energy and warmth',
    about: 'Sunflowers turn to face the light. A good match for habits that get you up and moving.',
    price: 0,
  },
  tulip: {
    id: 'tulip',
    name: 'Tulip',
    emoji: '🌷',
    meaning: 'Fresh starts',
    about: 'Tulips are among the first flowers of spring. Plant one for a habit you are just beginning.',
    price: 0,
  },
  bellflower: {
    id: 'bellflower',
    name: 'Bellflower',
    emoji: '🪻',
    meaning: 'Gratitude and gentleness',
    about: 'Bellflowers nod softly in the breeze. Perfect for kind, gentle habits.',
    price: 0,
  },
  bluebell: {
    id: 'bluebell',
    name: 'Bluebells',
    emoji: '💙',
    meaning: 'Calm and steadiness',
    about: 'Bluebells return to the same quiet woods year after year. Lovely for calming routines.',
    price: 0,
  },
  daisy: {
    id: 'daisy',
    name: 'Daisy',
    emoji: '🌼',
    meaning: 'Simple joys',
    about: 'Daisies open with the morning sun. For small habits that make a day brighter.',
    price: 60,
  },
  cactus: {
    id: 'cactus',
    name: 'Cactus flower',
    emoji: '🌵',
    meaning: 'Resilience',
    about: 'A cactus thrives where others give up, and still finds time to flower. For the hard habits.',
    price: 100,
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    meaning: 'Loving yourself',
    about: 'Roses need a little care and give plenty back. For habits that look after you.',
    price: 150,
  },
  cherry: {
    id: 'cherry',
    name: 'Cherry blossom',
    emoji: '🌸',
    meaning: 'Growth over time',
    about: 'A cherry tree takes patience, then blossoms beautifully. For the long-term habits.',
    price: 250,
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    emoji: '💜',
    meaning: 'Calm',
    about: 'Lavender settles a busy mind. For habits that slow the day down.',
    price: 80,
  },
  poppy: {
    id: 'poppy',
    name: 'Poppy',
    emoji: '🌺',
    meaning: 'Rest',
    about: 'Poppies close up at dusk and open again fresh. For sleep and winding down.',
    price: 120,
  },
  lily: {
    id: 'lily',
    name: 'Lily',
    emoji: '🤍',
    meaning: 'Kindness',
    about: 'Lilies are given to say someone matters. For habits you do for other people.',
    price: 180,
  },
  peony: {
    id: 'peony',
    name: 'Peony',
    emoji: '🏵️',
    meaning: 'Abundance',
    about: 'A peony bursts into more petals than seems possible. For habits that fill your life up.',
    price: 220,
  },
};

export const STARTER_PLANTS: readonly PlantSpecies[] = ['sunflower', 'tulip', 'bellflower', 'bluebell'];
export const SHOP_PLANTS: readonly PlantSpecies[] = [
  'daisy',
  'lavender',
  'cactus',
  'poppy',
  'rose',
  'lily',
  'peony',
  'cherry',
];

export function ownsPlant(species: PlantSpecies, ownedSeeds: readonly string[] | undefined) {
  return PLANTS[species].price === 0 || (ownedSeeds ?? []).includes(species);
}
