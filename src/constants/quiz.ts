/**
 * Onboarding quiz, after Finch's structure (four sections, follow-ups driven by
 * the chosen support areas) in Inhabit's own words. `{pet}` is replaced with the
 * dragon's name. Answers never leave the phone.
 */

export type QuizSection = 'about' | 'energy' | 'life' | 'support';

export const QuizSections: readonly { id: QuizSection; label: string }[] = [
  { id: 'about', label: 'About you' },
  { id: 'energy', label: 'Energy' },
  { id: 'life', label: 'How life is' },
  { id: 'support', label: 'Support' },
];

export type QuizOption = { id: string; emoji: string; label: string };

type BaseQuestion = { id: string; section: QuizSection; prompt: string };

export type QuizQuestion = BaseQuestion &
  (
    | { kind: 'text'; placeholder: string }
    | { kind: 'single'; options: readonly QuizOption[] }
    | { kind: 'multi'; options: readonly QuizOption[]; max?: number; exclusive?: readonly string[] }
  );

export type AreaId =
  | 'calm'
  | 'sleep'
  | 'movement'
  | 'focus'
  | 'eating'
  | 'connection'
  | 'kindness'
  | 'doing';

const PREFER_NOT: QuizOption = { id: 'skip', emoji: '🤐', label: 'Prefer not to say' };

/** Picking this shows a text box; its text is saved under `<question id>.other`. */
export const OTHER_ID = 'other';
const OTHER: QuizOption = { id: OTHER_ID, emoji: '✏️', label: 'Something else' };

export const QuizQuestions: readonly QuizQuestion[] = [
  // About you
  {
    id: 'name',
    section: 'about',
    kind: 'text',
    prompt: "Hi! I'm {pet}. What should I call you?",
    placeholder: 'Your name',
  },
  {
    id: 'age',
    section: 'about',
    kind: 'single',
    prompt: 'How old are you?',
    options: [
      { id: 'under18', emoji: '🌱', label: 'Under 18' },
      { id: '18-24', emoji: '🌿', label: '18-24' },
      { id: '25-34', emoji: '🌳', label: '25-34' },
      { id: '35-44', emoji: '🍃', label: '35-44' },
      { id: '45-54', emoji: '🍂', label: '45-54' },
      { id: '55plus', emoji: '🌾', label: '55 or older' },
      PREFER_NOT,
    ],
  },
  {
    id: 'gender',
    section: 'about',
    kind: 'single',
    prompt: 'How do you describe yourself?',
    options: [
      { id: 'woman', emoji: '👩', label: 'Woman' },
      { id: 'man', emoji: '👨', label: 'Man' },
      { id: 'nonbinary', emoji: '🧑', label: 'Non-binary' },
      PREFER_NOT,
    ],
  },
  {
    id: 'before',
    section: 'about',
    kind: 'single',
    prompt: 'Have you used a habit app before?',
    options: [
      { id: 'first', emoji: '✨', label: 'No, this is my first' },
      { id: 'lapsed', emoji: '🔁', label: "Yes, but it didn't stick" },
      { id: 'current', emoji: '📱', label: 'Yes, I use one now' },
    ],
  },

  // Energy
  {
    id: 'sleep',
    section: 'energy',
    kind: 'single',
    prompt: 'How much do you usually sleep?',
    options: [
      { id: 'under5', emoji: '😵', label: 'Less than 5 hours' },
      { id: '5-6', emoji: '🥱', label: '5-6 hours' },
      { id: '7-8', emoji: '😌', label: '7-8 hours' },
      { id: 'over8', emoji: '😴', label: 'More than 8 hours' },
    ],
  },
  {
    id: 'mornings',
    section: 'energy',
    kind: 'single',
    prompt: 'How easy is it to get out of bed?',
    options: [
      { id: 'easy', emoji: '🌞', label: 'Easy, I just get up' },
      { id: 'slow', emoji: '⏰', label: 'It takes a while' },
      { id: 'hard', emoji: '🛌', label: 'Really hard' },
    ],
  },
  {
    id: 'activity',
    section: 'energy',
    kind: 'single',
    prompt: 'How active are you on most days?',
    options: [
      { id: 'hardly', emoji: '🛋️', label: 'Hardly at all' },
      { id: 'little', emoji: '🚶', label: 'A little' },
      { id: 'fairly', emoji: '🚴', label: 'Fairly active' },
      { id: 'very', emoji: '🏃', label: 'Very active' },
    ],
  },
  {
    id: 'energyTime',
    section: 'energy',
    kind: 'single',
    prompt: 'When do you have the most energy?',
    options: [
      { id: 'morning', emoji: '🌅', label: 'Morning' },
      { id: 'afternoon', emoji: '☀️', label: 'Afternoon' },
      { id: 'evening', emoji: '🌆', label: 'Evening' },
      { id: 'night', emoji: '🌙', label: 'Late at night' },
    ],
  },

  // How life is
  {
    id: 'overwhelmed',
    section: 'life',
    kind: 'single',
    prompt: 'How often do you feel overwhelmed?',
    options: [
      { id: 'rarely', emoji: '🌤️', label: 'Rarely' },
      { id: 'sometimes', emoji: '⛅', label: 'Sometimes' },
      { id: 'often', emoji: '🌧️', label: 'Often' },
      { id: 'always', emoji: '⛈️', label: 'Almost all the time' },
    ],
  },
  {
    id: 'people',
    section: 'life',
    kind: 'single',
    prompt: 'Do you have people you can lean on?',
    options: [
      { id: 'few', emoji: '🫂', label: 'Yes, a few' },
      { id: 'one', emoji: '🤝', label: 'One or two' },
      { id: 'none', emoji: '🌫️', label: 'Not really' },
    ],
  },
  {
    id: 'routine',
    section: 'life',
    kind: 'single',
    prompt: 'How do you feel about your daily routine?',
    options: [
      { id: 'like', emoji: '💚', label: 'I like it' },
      { id: 'okay', emoji: '👌', label: "It's okay" },
      { id: 'change', emoji: '🔄', label: 'I want a change' },
      { id: 'none', emoji: '🌀', label: "I don't really have one" },
    ],
  },
  {
    id: 'weighing',
    section: 'life',
    kind: 'multi',
    prompt: 'Is anything weighing on you lately?',
    options: [
      { id: 'stress', emoji: '😣', label: 'Stress' },
      { id: 'lowmood', emoji: '🌧️', label: 'Low mood' },
      { id: 'anxiety', emoji: '😟', label: 'Worry or anxiety' },
      { id: 'lonely', emoji: '🥺', label: 'Feeling lonely' },
      { id: 'burnout', emoji: '🪫', label: 'Burnout' },
      { id: 'focus', emoji: '🌀', label: 'Trouble focusing' },
      { id: 'nothing', emoji: '🙂', label: 'Nothing right now' },
      PREFER_NOT,
    ],
    exclusive: ['nothing', 'skip'],
  },

  // Support
  {
    id: 'areas',
    section: 'support',
    kind: 'multi',
    prompt: 'What would you like help with?',
    max: 3,
    options: [
      { id: 'calm', emoji: '🫧', label: 'Feeling calmer' },
      { id: 'sleep', emoji: '😴', label: 'Sleeping better' },
      { id: 'movement', emoji: '🤸', label: 'Moving more' },
      { id: 'focus', emoji: '🎯', label: 'Focus' },
      { id: 'eating', emoji: '🥗', label: 'Eating well' },
      { id: 'connection', emoji: '💬', label: 'Staying in touch' },
      { id: 'kindness', emoji: '💗', label: 'Being kinder to myself' },
      { id: 'doing', emoji: '✅', label: 'Getting things done' },
    ],
  },
];

/** One follow-up per chosen area. Only the first two chosen areas get one. */
export const AreaFollowUps: Record<AreaId, QuizQuestion> = {
  calm: {
    id: 'followup.calm',
    section: 'support',
    kind: 'multi',
    prompt: 'What overwhelms you the most?',
    options: [
      { id: 'work', emoji: '💼', label: 'Work or studies' },
      { id: 'money', emoji: '💸', label: 'Money' },
      { id: 'people', emoji: '👥', label: 'People and relationships' },
      { id: 'everything', emoji: '🌪️', label: 'Everything at once' },
      OTHER,
    ],
  },
  sleep: {
    id: 'followup.sleep',
    section: 'support',
    kind: 'multi',
    prompt: 'What keeps you up at night?',
    options: [
      { id: 'phone', emoji: '📱', label: 'My phone' },
      { id: 'thoughts', emoji: '💭', label: 'Racing thoughts' },
      { id: 'schedule', emoji: '🕰️', label: 'An uneven schedule' },
      { id: 'room', emoji: '🔦', label: 'Noise or light' },
      OTHER,
    ],
  },
  movement: {
    id: 'followup.movement',
    section: 'support',
    kind: 'multi',
    prompt: 'What makes moving more hard?',
    options: [
      { id: 'time', emoji: '⏳', label: 'No time' },
      { id: 'energy', emoji: '🪫', label: 'No energy' },
      { id: 'start', emoji: '🧭', label: 'Not sure where to start' },
      { id: 'bored', emoji: '😑', label: 'I get bored' },
      OTHER,
    ],
  },
  focus: {
    id: 'followup.focus',
    section: 'support',
    kind: 'multi',
    prompt: 'What pulls your focus away?',
    options: [
      { id: 'phone', emoji: '📱', label: 'My phone' },
      { id: 'noise', emoji: '🔊', label: 'Noise around me' },
      { id: 'mind', emoji: '🦋', label: 'My mind wanders' },
      { id: 'tired', emoji: '🥱', label: 'Being tired' },
      OTHER,
    ],
  },
  eating: {
    id: 'followup.eating',
    section: 'support',
    kind: 'multi',
    prompt: 'What gets in the way of eating well?',
    options: [
      { id: 'busy', emoji: '🏃', label: 'Busy days' },
      { id: 'cravings', emoji: '🍩', label: 'Cravings' },
      { id: 'cooking', emoji: '🍳', label: 'Cooking feels like a chore' },
      { id: 'skipping', emoji: '⏭️', label: 'I skip meals' },
      OTHER,
    ],
  },
  connection: {
    id: 'followup.connection',
    section: 'support',
    kind: 'multi',
    prompt: 'What makes staying in touch hard?',
    options: [
      { id: 'time', emoji: '⏳', label: 'Not enough time' },
      { id: 'awkward', emoji: '😬', label: 'It feels awkward' },
      { id: 'far', emoji: '🗺️', label: 'People are far away' },
      { id: 'who', emoji: '❓', label: 'Not sure who to reach out to' },
      OTHER,
    ],
  },
  kindness: {
    id: 'followup.kindness',
    section: 'support',
    kind: 'multi',
    prompt: 'When are you hardest on yourself?',
    options: [
      { id: 'mistakes', emoji: '🙈', label: 'After a mistake' },
      { id: 'comparing', emoji: '🪞', label: 'Comparing myself to others' },
      { id: 'body', emoji: '🧍', label: 'About how I look' },
      { id: 'rest', emoji: '🛋️', label: 'When I take a break' },
      OTHER,
    ],
  },
  doing: {
    id: 'followup.doing',
    section: 'support',
    kind: 'multi',
    prompt: 'Why do things get put off?',
    options: [
      { id: 'big', emoji: '🏔️', label: 'Tasks feel too big' },
      { id: 'start', emoji: '🧭', label: 'Not sure where to start' },
      { id: 'distracted', emoji: '🦋', label: 'I get distracted' },
      { id: 'mood', emoji: '🌦️', label: 'Waiting for the right mood' },
      OTHER,
    ],
  },
};

export type QuizAnswers = Record<string, string | string[]>;

/** The full question list for these answers: base questions, then one follow-up per area. */
export function buildQuiz(answers: QuizAnswers): QuizQuestion[] {
  const areas = (answers.areas as AreaId[] | undefined) ?? [];
  return [...QuizQuestions, ...areas.map((area) => AreaFollowUps[area])];
}

export function fillPet(text: string, pet: string) {
  return text.replaceAll('{pet}', pet);
}
