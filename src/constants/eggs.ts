import type { ImageSource } from 'expo-image';

export type EggId = 'lavender' | 'mint' | 'gold' | 'pink' | 'blue' | 'plum';

export type Egg = {
  id: EggId;
  label: string;
  image: ImageSource;
  shellBase: ImageSource;
  shellCap: ImageSource;
};

export const Eggs: readonly Egg[] = [
  {
    id: 'lavender',
    label: 'Lavender',
    image: require('@/assets/images/eggs/lavender.png'),
    shellBase: require('@/assets/images/shells/lavender-base.png'),
    shellCap: require('@/assets/images/shells/lavender-cap.png'),
  },
  {
    id: 'mint',
    label: 'Mint',
    image: require('@/assets/images/eggs/mint.png'),
    shellBase: require('@/assets/images/shells/mint-base.png'),
    shellCap: require('@/assets/images/shells/mint-cap.png'),
  },
  {
    id: 'gold',
    label: 'Gold',
    image: require('@/assets/images/eggs/gold.png'),
    shellBase: require('@/assets/images/shells/gold-base.png'),
    shellCap: require('@/assets/images/shells/gold-cap.png'),
  },
  {
    id: 'pink',
    label: 'Pink',
    image: require('@/assets/images/eggs/pink.png'),
    shellBase: require('@/assets/images/shells/pink-base.png'),
    shellCap: require('@/assets/images/shells/pink-cap.png'),
  },
  {
    id: 'blue',
    label: 'Sky',
    image: require('@/assets/images/eggs/blue.png'),
    shellBase: require('@/assets/images/shells/blue-base.png'),
    shellCap: require('@/assets/images/shells/blue-cap.png'),
  },
  {
    id: 'plum',
    label: 'Plum',
    image: require('@/assets/images/eggs/plum.png'),
    shellBase: require('@/assets/images/shells/plum-base.png'),
    shellCap: require('@/assets/images/shells/plum-cap.png'),
  },
];

export function getEgg(id: EggId): Egg {
  return Eggs.find((egg) => egg.id === id) ?? Eggs[0];
}
