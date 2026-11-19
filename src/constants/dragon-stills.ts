import type { Stage } from '@/engine/rules';
import type { DragonColour } from '@/constants/dragon-colours';
export const DRAGON_STILLS: Record<DragonColour, Record<Stage, number>> = {
  lavender: {
    baby: require('@/assets/images/dragon/anim/idle.png'),
    young: require('@/assets/images/dragon/young/anim-idle.png'),
    teen: require('@/assets/images/dragon/teen/anim-idle.png'),
    grown: require('@/assets/images/dragon/grown/anim-idle.png'),
  },
  blue: {
    baby: require('@/assets/images/dragon-blue/anim/idle.png'),
    young: require('@/assets/images/dragon-blue/young/anim-idle.png'),
    teen: require('@/assets/images/dragon-blue/teen/anim-idle.png'),
    grown: require('@/assets/images/dragon-blue/grown/anim-idle.png'),
  },
};

export const DRAGON_STILL_ASPECT = { baby: 485 / 600, young: 545 / 600, teen: 465 / 624, grown: 397 / 624 } as const;
