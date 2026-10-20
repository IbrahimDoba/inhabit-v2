import { lookForStage, type DragonLook } from '@/components/dragon-sprite';
import { Expressions, YoungExpressions } from '@/constants/dragon';
import { useCompanion } from '@/hooks/use-companion';

/** Which art the dragon uses right now: the baby before it has hatched or grown, then the young art. */
export function useDragonLook(): DragonLook {
  const { companion } = useCompanion();
  return companion ? lookForStage(companion.stage) : 'baby';
}

/** The dragon's face portraits for its current look. */
export function useExpressions() {
  return useDragonLook() === 'baby' ? Expressions : YoungExpressions;
}
