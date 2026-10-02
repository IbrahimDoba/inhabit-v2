/**
 * Every tunable number in the companion rules, from PLAN.md section 3.
 * Change balance here, not in the engine.
 */

export type Stage = 'baby' | 'young' | 'teen' | 'grown';

export const STAGES: readonly Stage[] = ['baby', 'young', 'teen', 'grown'];

export type StageRules = {
  label: string;
  /** Full-care days spent in this stage before growing to the next. `null` for the last stage. */
  daysToGrow: number | null;
  fullBar: number;
  journeyHours: number;
  /** Diamonds a journey brings back at this stage. */
  journeyDiamonds: number;
};

export const STAGE_RULES: Record<Stage, StageRules> = {
  baby: { label: 'Baby', daysToGrow: 7, fullBar: 15, journeyHours: 8, journeyDiamonds: 20 },
  young: { label: 'Young', daysToGrow: 15, fullBar: 20, journeyHours: 7, journeyDiamonds: 25 },
  teen: { label: 'Teen', daysToGrow: 20, fullBar: 25, journeyHours: 6, journeyDiamonds: 30 },
  grown: { label: 'Grown', daysToGrow: null, fullBar: 30, journeyHours: 6, journeyDiamonds: 35 },
};

/** Energy each habit gives. Custom sizes come later. */
export const ENERGY_PER_HABIT = 5;

/** A welcome bonus on top of the very first journey, so the shop is reachable early. */
export const FIRST_JOURNEY_BONUS = 100;

/** Habits done after the bar is full still count for something, just not much. */
export const EXTRA_HABIT_DIAMONDS = 1;

/** Night for mood purposes: the dragon is sleepy from 22:00 until 06:00. */
export const NIGHT_STARTS_HOUR = 22;
export const NIGHT_ENDS_HOUR = 6;

export type PropId =
  | 'flowers'
  | 'stones'
  | 'mushrooms'
  | 'lantern'
  | 'bench'
  | 'fence'
  | 'pond';

/** The fixed garden spots, in the order gifts fill them. */
export const GARDEN_PROPS: readonly PropId[] = [
  'flowers',
  'stones',
  'mushrooms',
  'lantern',
  'bench',
  'fence',
  'pond',
];

/** Once every spot is filled, gifts upgrade a spot instead, up to this level. */
export const MAX_PROP_LEVEL = 3;
