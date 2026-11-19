import type { ImageSource } from 'expo-image';

import type { BadgeId } from '@/engine/badges';

export const BADGE_ART: Record<BadgeId, ImageSource> = {
  hatched: require('@/assets/images/badges/hatched.png'),
  'first-habit': require('@/assets/images/badges/first-habit.png'),
  'streak-3': require('@/assets/images/badges/streak-3.png'),
  'first-journey': require('@/assets/images/badges/first-journey.png'),
  'streak-7': require('@/assets/images/badges/streak-7.png'),
  young: require('@/assets/images/badges/young.png'),
  'first-bloom': require('@/assets/images/badges/first-bloom.png'),
  'streak-14': require('@/assets/images/badges/streak-14.png'),
  teen: require('@/assets/images/badges/teen.png'),
  'five-blooms': require('@/assets/images/badges/five-blooms.png'),
  'streak-30': require('@/assets/images/badges/streak-30.png'),
  grown: require('@/assets/images/badges/grown.png'),
};
