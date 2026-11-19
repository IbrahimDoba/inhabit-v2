/** What Inhabit Plus gives. Change the offer here, not in the screens. */

/** Extra diamonds a Plus dragon brings home from each journey, as a share of the journey's own. */
export const PLUS_JOURNEY_BONUS = 0.5;

/** Shop items only Plus members can buy. Anything already owned stays owned for good. */
export const PLUS_ITEMS: readonly string[] = ['peony', 'archway', 'bridge', 'bed-cloud'];

export const isPlusItem = (id: string) => PLUS_ITEMS.includes(id);

export const PLUS_PERKS: readonly { emoji: string; title: string; detail: string }[] = [
  { emoji: '💎', title: 'Half again as many diamonds', detail: 'Every journey brings home 50% more.' },
  { emoji: '🏵️', title: 'The Plus collection', detail: 'Peony seeds, the garden archway and bridge, the cloud bed.' },
  { emoji: '💜', title: 'Keep the garden growing', detail: 'You help a tiny team make more for your dragon.' },
];

export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
/** Served by `server/src/routes/legal.ts`; live once that is deployed. */
export const PRIVACY_URL = 'https://inhabit-api.dailzero.com/privacy';
