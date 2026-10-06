import { claimableCount, questStatuses, type QuestContext } from '@/engine/quests';
import { useCompanion } from '@/hooks/use-companion';
import { useHabits } from '@/hooks/use-habits';
import { STAGE_THRESHOLDS } from '@/lib/plants';

const BLOOM_AT = STAGE_THRESHOLDS.find((t) => t.stage === 'bloom')?.from ?? 14;

/** Quest progress for the current dragon and garden. */
export function useQuests() {
  const { companion } = useCompanion();
  const { habits, log } = useHabits();

  const ctx: QuestContext = {
    habitCount: habits?.length ?? 0,
    // Growth never goes back, so a plant that once bloomed is still counted.
    bloomCount: Object.values(log).filter((days) => new Set(days).size >= BLOOM_AT).length,
  };

  return {
    ctx,
    statuses: companion ? questStatuses(companion, ctx) : [],
    claimable: companion ? claimableCount(companion, ctx) : 0,
  };
}
