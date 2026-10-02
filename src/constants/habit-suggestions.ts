import type { TimeOfDay } from '@/lib/habits';

export type HabitSuggestion = { emoji: string; title: string; timeOfDay: TimeOfDay };

export const SUGGESTION_GROUPS: readonly { id: string; label: string; items: readonly HabitSuggestion[] }[] = [
  {
    id: 'easy',
    label: 'Easy wins',
    items: [
      { emoji: '💧', title: 'Drink a glass of water', timeOfDay: 'any' },
      { emoji: '🛏️', title: 'Make my bed', timeOfDay: 'morning' },
      { emoji: '🪥', title: 'Brush my teeth', timeOfDay: 'morning' },
      { emoji: '👕', title: 'Get dressed', timeOfDay: 'morning' },
      { emoji: '🪟', title: 'Open a window', timeOfDay: 'morning' },
      { emoji: '🧺', title: 'Tidy one small thing', timeOfDay: 'any' },
    ],
  },
  {
    id: 'calm',
    label: 'Calm',
    items: [
      { emoji: '🫧', title: 'Breathe slowly for a minute', timeOfDay: 'any' },
      { emoji: '🌤️', title: 'Step outside', timeOfDay: 'afternoon' },
      { emoji: '✍️', title: 'Write one line in a journal', timeOfDay: 'evening' },
      { emoji: '🎧', title: 'Listen to a song I love', timeOfDay: 'any' },
      { emoji: '📵', title: 'Ten minutes without my phone', timeOfDay: 'evening' },
    ],
  },
  {
    id: 'move',
    label: 'Move',
    items: [
      { emoji: '🚶', title: 'Take a short walk', timeOfDay: 'afternoon' },
      { emoji: '🤸', title: 'Stretch for two minutes', timeOfDay: 'morning' },
      { emoji: '💃', title: 'Dance to one song', timeOfDay: 'any' },
      { emoji: '🧘', title: 'Five minutes of yoga', timeOfDay: 'morning' },
    ],
  },
  {
    id: 'connect',
    label: 'Connect',
    items: [
      { emoji: '💬', title: 'Message someone I like', timeOfDay: 'any' },
      { emoji: '📞', title: 'Call a friend or family', timeOfDay: 'evening' },
      { emoji: '🙏', title: 'Thank someone', timeOfDay: 'any' },
    ],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    items: [
      { emoji: '🌙', title: 'Phone away before bed', timeOfDay: 'bedtime' },
      { emoji: '📖', title: 'Read a few pages', timeOfDay: 'bedtime' },
      { emoji: '🚿', title: 'Warm shower before bed', timeOfDay: 'bedtime' },
      { emoji: '😴', title: 'In bed by my bedtime', timeOfDay: 'bedtime' },
    ],
  },
];

/** Emoji to pick from when making your own habit. */
export const HABIT_EMOJI: readonly string[] = [
  '✨', '💧', '🛏️', '🪥', '🚶', '🤸', '🧘', '💃',
  '🫧', '🌤️', '🌙', '📖', '✍️', '🎧', '🎨', '🎸',
  '🍎', '🥗', '☕', '🧺', '🪴', '🐶', '💬', '📞',
  '💗', '🙏', '📵', '💻', '📚', '💊', '🚿', '😴',
];
