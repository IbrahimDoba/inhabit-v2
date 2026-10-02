import {
  SKY_KEYFRAMES,
  SUNRISE_HOUR,
  SUNSET_HOUR,
  type SkyKeyframe,
} from '@/constants/sky';

export type SkyState = {
  hour: number;
  top: string;
  bottom: string;
  night: number;
  warmth: number;
  /** 0 to 1 across the sky from left to right, or null when down. */
  sun: number | null;
  moon: number | null;
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Hours since midnight, with minutes as a fraction. */
export function hourOf(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

/** The sky at a given hour (0 to 24). */
export function skyAt(hour: number): SkyState {
  const h = ((hour % 24) + 24) % 24;
  let i = SKY_KEYFRAMES.findIndex((k) => k.hour > h);
  if (i <= 0) i = 1;
  const a: SkyKeyframe = SKY_KEYFRAMES[i - 1];
  const b: SkyKeyframe = SKY_KEYFRAMES[i];
  const t = (h - a.hour) / (b.hour - a.hour);

  const sunUp = h >= SUNRISE_HOUR && h <= SUNSET_HOUR;
  const nightLength = 24 - SUNSET_HOUR + SUNRISE_HOUR;
  const intoNight = (h - SUNSET_HOUR + 24) % 24;

  return {
    hour: h,
    top: mixHex(a.top, b.top, t),
    bottom: mixHex(a.bottom, b.bottom, t),
    night: a.night + (b.night - a.night) * t,
    warmth: a.warmth + (b.warmth - a.warmth) * t,
    sun: sunUp ? (h - SUNRISE_HOUR) / (SUNSET_HOUR - SUNRISE_HOUR) : null,
    moon: sunUp ? null : intoNight / nightLength,
  };
}
