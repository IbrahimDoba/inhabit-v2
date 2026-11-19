import type { Stage } from '@/engine/rules';

/** Every earned growth stage has its own artwork. */
export type DragonLook = Stage;
export function lookForStage(stage: Stage): DragonLook { return stage; }
