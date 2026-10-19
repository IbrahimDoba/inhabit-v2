import { ICONS, type IconArt } from '@/constants/icons';

/** Emoji, including skin tones, variation selectors and joined (ZWJ) sequences. */
export const EMOJI_PATTERN =
  /(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{23F0}-\u{23FF}\u{2194}-\u{21FF}](?:️)?(?:‍[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}](?:️)?)*)/gu;

/** Twemoji's file name for an emoji: hex code points, without FE0F unless it is a joined sequence. */
export function codeFor(emoji: string) {
  const points = [...emoji].map((c) => c.codePointAt(0)!.toString(16));
  return (points.includes('200d') ? points : points.filter((p) => p !== 'fe0f')).join('-');
}

/** The bundled sticker art for an emoji, if the app has it. */
export function iconArt(emoji: string): IconArt | undefined {
  return ICONS[codeFor(emoji)];
}

export type TextPart = { text: string } | { emoji: string; art: IconArt };

/** Splits text into plain runs and emoji that have sticker art. Emoji without art stay text. */
export function splitIcons(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(EMOJI_PATTERN)) {
    const art = iconArt(match[0]);
    if (!art) continue;
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start) });
    parts.push({ emoji: match[0], art });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
