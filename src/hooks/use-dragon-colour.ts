import { colourForEgg, type DragonColour } from '@/constants/dragon-colours';
import { useOnboarding } from '@/hooks/use-onboarding';

/** The dragon's colour, from the egg chosen in onboarding. */
export function useDragonColour(): DragonColour {
  return colourForEgg(useOnboarding().eggId);
}
