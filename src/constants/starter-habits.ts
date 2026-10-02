import type { AreaId } from '@/constants/quiz';
import { ENERGY_PER_HABIT, STAGE_RULES } from '@/engine/rules';
import type { TimeOfDay } from '@/lib/habits';

export { ENERGY_PER_HABIT };
export const BABY_FULL_BAR = STAGE_RULES.baby.fullBar;
/** Enough habits to fill the baby's bar on day one. */
export const STARTER_HABIT_COUNT = BABY_FULL_BAR / ENERGY_PER_HABIT;

export type StarterHabit = {
  id: string;
  emoji: string;
  label: string;
  /** Support areas from the quiz that this habit helps with. */
  areas: readonly AreaId[];
  /** Under two minutes and no effort to start. Favoured when life feels heavy. */
  tiny?: boolean;
  /** When it usually fits, used when it becomes one of your habits. */
  timeOfDay: TimeOfDay;
};

export const StarterHabits: readonly StarterHabit[] = [
  { id: 'water', emoji: '💧', label: 'Drink a glass of water', areas: ['eating'], tiny: true, timeOfDay: 'any' },
  { id: 'bed', emoji: '🛏️', label: 'Make my bed', areas: ['doing'], tiny: true, timeOfDay: 'morning' },
  { id: 'walk', emoji: '🚶', label: 'Take a short walk', areas: ['movement', 'calm'], timeOfDay: 'afternoon' },
  {
    id: 'breathe',
    emoji: '🫧',
    label: 'Breathe slowly for a minute',
    areas: ['calm', 'sleep'],
    tiny: true,
    timeOfDay: 'any',
  },
  { id: 'read', emoji: '📖', label: 'Read a few pages', areas: ['focus', 'sleep'], timeOfDay: 'bedtime' },
  { id: 'fruit', emoji: '🍎', label: 'Eat some fruit or veg', areas: ['eating'], tiny: true, timeOfDay: 'any' },
  {
    id: 'stretch',
    emoji: '🤸',
    label: 'Stretch for two minutes',
    areas: ['movement', 'calm'],
    tiny: true,
    timeOfDay: 'morning',
  },
  { id: 'outside', emoji: '🌤️', label: 'Step outside', areas: ['calm', 'movement'], tiny: true, timeOfDay: 'afternoon' },
  { id: 'journal', emoji: '✍️', label: 'Write one line in a journal', areas: ['calm', 'kindness'], timeOfDay: 'evening' },
  { id: 'phone', emoji: '📵', label: 'Ten minutes without my phone', areas: ['focus', 'calm'], timeOfDay: 'evening' },
  { id: 'friend', emoji: '💬', label: 'Message someone I like', areas: ['connection'], timeOfDay: 'any' },
  { id: 'tidy', emoji: '🧺', label: 'Tidy one small thing', areas: ['doing'], tiny: true, timeOfDay: 'any' },
  { id: 'bedtime', emoji: '🌙', label: 'Phone away before bed', areas: ['sleep'], timeOfDay: 'bedtime' },
  { id: 'onetask', emoji: '🪜', label: 'Do one small task first', areas: ['doing', 'focus'], timeOfDay: 'morning' },
  { id: 'focus', emoji: '🎯', label: 'Focus on one thing for ten minutes', areas: ['focus'], timeOfDay: 'morning' },
  {
    id: 'kind',
    emoji: '💗',
    label: 'Say one kind thing to myself',
    areas: ['kindness'],
    tiny: true,
    timeOfDay: 'any',
  },
];

export type ReminderId = 'morning' | 'midday' | 'evening' | 'bedtime' | 'none';

export type Reminder = {
  id: ReminderId;
  emoji: string;
  label: string;
  time: string | null;
};

export const Reminders: readonly Reminder[] = [
  { id: 'morning', emoji: '🌅', label: 'Morning', time: '8:00' },
  { id: 'midday', emoji: '☀️', label: 'Midday', time: '12:30' },
  { id: 'evening', emoji: '🌆', label: 'Evening', time: '18:30' },
  { id: 'bedtime', emoji: '🌙', label: 'Before bed', time: '21:30' },
  { id: 'none', emoji: '🔕', label: 'No reminder', time: null },
];
