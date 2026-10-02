import type { PropId } from './rules';

/**
 * Short journey stories, told when the dragon comes home. `{pet}` is the dragon's
 * name and `{gift}` the gift's name. Warm, small, never about the user failing.
 */
export const JOURNEY_STORIES: readonly string[] = [
  '{pet} followed a butterfly all the way to the old stone bridge and found {gift} waiting there.',
  '{pet} helped a lost beetle find its way home. The beetle said thank you with {gift}.',
  '{pet} climbed the tallest hill to watch the clouds, and rolled back down with {gift}.',
  '{pet} spent the afternoon by the river, counting fish, and came home with {gift}.',
  '{pet} met a sleepy owl who told the best stories, and swapped one for {gift}.',
  '{pet} explored a forest of giant ferns and found {gift} under the biggest leaf.',
  '{pet} tried to catch the wind, missed every time, and found {gift} instead.',
  '{pet} visited the meadow market and traded a very shiny pebble for {gift}.',
];

export const GIFT_NAMES: Record<PropId, string> = {
  flowers: 'a bunch of wildflower seeds',
  stones: 'some smooth stepping stones',
  mushrooms: 'a ring of little mushrooms',
  lantern: 'a glowing lantern',
  bench: 'a wooden bench',
  fence: 'a little picket fence',
  pond: 'a tiny pond',
};

/** What each gift becomes once it is in the garden. */
export const PROP_NAMES: Record<PropId, string> = {
  flowers: 'wildflower patch',
  stones: 'stepping stones',
  mushrooms: 'mushroom ring',
  lantern: 'lantern',
  bench: 'bench',
  fence: 'little fence',
  pond: 'pond',
};

export function tellStory(template: string, pet: string, gift: PropId): string {
  return template.replaceAll('{pet}', pet).replaceAll('{gift}', GIFT_NAMES[gift]);
}
