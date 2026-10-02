import type { ImageSource } from 'expo-image';

export type Expression = 'neutral' | 'happy' | 'sleepy' | 'proud' | 'curious';

/** Head-and-shoulders portraits, cut flat at the bottom. Show them in a frame. */
export const Expressions: Record<Expression, ImageSource> = {
  neutral: require('@/assets/images/dragon/neutral.png'),
  happy: require('@/assets/images/dragon/happy.png'),
  sleepy: require('@/assets/images/dragon/sleepy.png'),
  proud: require('@/assets/images/dragon/proud.png'),
  curious: require('@/assets/images/dragon/curious.png'),
};

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
