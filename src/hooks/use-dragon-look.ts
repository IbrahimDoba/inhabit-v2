import { lookForStage, type DragonLook } from '@/components/dragon-sprite';
import { ExpressionArt } from '@/constants/dragon';
import { useCompanion } from '@/hooks/use-companion';
import { useDragonColour } from '@/hooks/use-dragon-colour';

/** Which art the dragon uses right now: the baby before it has hatched or grown, then each earned stage's own art. */
export function useDragonLook(): DragonLook {
  const { companion } = useCompanion();
  return companion ? lookForStage(companion.stage) : 'baby';
}

/** The dragon's face portraits for its colour and current look. */
export function useExpressions() {
  return ExpressionArt[useDragonColour()][useDragonLook()];
}
