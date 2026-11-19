import type { ImageSource } from 'expo-image';

import type { DragonLook } from '@/components/dragon-sprite';
import type { DragonColour } from '@/constants/dragon-colours';

export type Expression = 'neutral' | 'happy' | 'sleepy' | 'proud' | 'curious';

/**
 * Head-and-shoulders portraits, cut flat at the bottom: show them in a frame. Per colour,
 * then per look: after the first growth the snout and neck are longer, so the young
 * pictures are taller.
 */
export const ExpressionArt: Record<
  DragonColour,
  Record<DragonLook, Record<Expression, ImageSource>>
> = {
  lavender: {
    baby: {
      neutral: require('@/assets/images/dragon/neutral.png'),
      happy: require('@/assets/images/dragon/happy.png'),
      sleepy: require('@/assets/images/dragon/sleepy.png'),
      proud: require('@/assets/images/dragon/proud.png'),
      curious: require('@/assets/images/dragon/curious.png'),
    },
    young: {
      neutral: require('@/assets/images/dragon/young/neutral.png'),
      happy: require('@/assets/images/dragon/young/happy.png'),
      sleepy: require('@/assets/images/dragon/young/sleepy.png'),
      proud: require('@/assets/images/dragon/young/proud.png'),
      curious: require('@/assets/images/dragon/young/curious.png'),
    },
    teen: {
      neutral: require('@/assets/images/dragon/teen/neutral.png'),
      happy: require('@/assets/images/dragon/teen/happy.png'),
      sleepy: require('@/assets/images/dragon/teen/sleepy.png'),
      proud: require('@/assets/images/dragon/teen/proud.png'),
      curious: require('@/assets/images/dragon/teen/curious.png'),
    },
  grown: {
      neutral: require('@/assets/images/dragon/grown/neutral.png'),
      happy: require('@/assets/images/dragon/grown/happy.png'),
      sleepy: require('@/assets/images/dragon/grown/sleepy.png'),
      proud: require('@/assets/images/dragon/grown/proud.png'),
      curious: require('@/assets/images/dragon/grown/curious.png'),
    },
  },
  blue: {
    baby: {
      neutral: require('@/assets/images/dragon-blue/neutral.png'),
      happy: require('@/assets/images/dragon-blue/happy.png'),
      sleepy: require('@/assets/images/dragon-blue/sleepy.png'),
      proud: require('@/assets/images/dragon-blue/proud.png'),
      curious: require('@/assets/images/dragon-blue/curious.png'),
    },
    young: {
      neutral: require('@/assets/images/dragon-blue/young/neutral.png'),
      happy: require('@/assets/images/dragon-blue/young/happy.png'),
      sleepy: require('@/assets/images/dragon-blue/young/sleepy.png'),
      proud: require('@/assets/images/dragon-blue/young/proud.png'),
      curious: require('@/assets/images/dragon-blue/young/curious.png'),
    },
    teen: {
      neutral: require('@/assets/images/dragon-blue/teen/neutral.png'),
      happy: require('@/assets/images/dragon-blue/teen/happy.png'),
      sleepy: require('@/assets/images/dragon-blue/teen/sleepy.png'),
      proud: require('@/assets/images/dragon-blue/teen/proud.png'),
      curious: require('@/assets/images/dragon-blue/teen/curious.png'),
    },
  grown: {
      neutral: require('@/assets/images/dragon-blue/grown/neutral.png'),
      happy: require('@/assets/images/dragon-blue/grown/happy.png'),
      sleepy: require('@/assets/images/dragon-blue/grown/sleepy.png'),
      proud: require('@/assets/images/dragon-blue/grown/proud.png'),
      curious: require('@/assets/images/dragon-blue/grown/curious.png'),
    },
  },
};

/** Width / height of the portraits for each look, for cropping a face out of them. */
export const PORTRAIT_ASPECT = { baby: 551 / 666, young: 560 / 928, teen: 0.7692307692307693, grown: 0.6971153846153846 } as const;

export type TraitId = 'curious' | 'playful' | 'brave' | 'gentle' | 'dreamy';

export type Trait = {
  id: TraitId;
  label: string;
  emoji: string;
  description: string;
  expression: Expression;
};

export const Traits: readonly Trait[] = [
  {
    id: 'curious',
    label: 'Curious',
    emoji: '🔍',
    description: 'Wants to know how everything works.',
    expression: 'curious',
  },
  {
    id: 'playful',
    label: 'Playful',
    emoji: '🎈',
    description: 'Turns every chore into a game.',
    expression: 'happy',
  },
  {
    id: 'brave',
    label: 'Brave',
    emoji: '🔥',
    description: 'Always first to try something new.',
    expression: 'proud',
  },
  {
    id: 'gentle',
    label: 'Gentle',
    emoji: '🌸',
    description: 'Notices when you need a quiet day.',
    expression: 'neutral',
  },
  {
    id: 'dreamy',
    label: 'Dreamy',
    emoji: '🌙',
    description: 'Loves long naps and big ideas.',
    expression: 'sleepy',
  },
];

export const NAME_MAX_LENGTH = 16;

export const SuggestedNames = [
  'Pip',
  'Mochi',
  'Clover',
  'Biscuit',
  'Nimbus',
  'Sprout',
  'Maple',
  'Pebble',
  'Juniper',
  'Wren',
  'Fig',
  'Poppy',
  'Bramble',
  'Tansy',
  'Moss',
  'Quill',
] as const;

export function randomName(exclude?: string): string {
  const options = SuggestedNames.filter((name) => name !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}
