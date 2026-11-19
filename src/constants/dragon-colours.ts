import type { EggId } from '@/constants/eggs';

/** The dragon's colour: the lavender art, or the same art recoloured by scripts/recolour.py. */
export type DragonColour = 'lavender' | 'blue';

/** Which dragon each egg holds. Only these eggs are offered in onboarding. */
export const EGG_COLOURS: Partial<Record<EggId, DragonColour>> = {
  lavender: 'lavender',
  blue: 'blue',
};

/** The dragon an egg hatches. Eggs from older saves hatch lavender. */
export function colourForEgg(egg: EggId): DragonColour {
  return EGG_COLOURS[egg] ?? 'lavender';
}
