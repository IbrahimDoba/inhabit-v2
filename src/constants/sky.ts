/**
 * How the sky looks through the day. Between two keyframes every value blends
 * smoothly, so the scene drifts from dawn to night with the real clock.
 * `night` (0 to 1) fades in the night garden, stars and fireflies; `warmth`
 * (0 to 1) washes the garden in golden-hour light.
 */
export type SkyKeyframe = {
  hour: number;
  top: string;
  bottom: string;
  night: number;
  warmth: number;
};

export const SKY_KEYFRAMES: readonly SkyKeyframe[] = [
  { hour: 0, top: '#0F1033', bottom: '#2B2A5E', night: 1, warmth: 0 },
  { hour: 5, top: '#1D1D4A', bottom: '#4A3F78', night: 0.9, warmth: 0 },
  { hour: 6.5, top: '#7FA7D9', bottom: '#F7C6A3', night: 0.25, warmth: 0.6 },
  { hour: 8, top: '#8EC9F5', bottom: '#DDF0FB', night: 0, warmth: 0.1 },
  { hour: 12, top: '#79BFF2', bottom: '#D6EEFB', night: 0, warmth: 0 },
  { hour: 16.5, top: '#8CC4F0', bottom: '#F3E6C8', night: 0, warmth: 0.25 },
  { hour: 18.5, top: '#E98E7A', bottom: '#FBD38D', night: 0.1, warmth: 0.85 },
  { hour: 19.5, top: '#5E4F96', bottom: '#E48A8F', night: 0.55, warmth: 0.4 },
  { hour: 21, top: '#1C1B4A', bottom: '#3A3470', night: 1, warmth: 0 },
  { hour: 24, top: '#0F1033', bottom: '#2B2A5E', night: 1, warmth: 0 },
];

/** The sun is up between these hours; the moon the rest of the time. */
export const SUNRISE_HOUR = 6;
export const SUNSET_HOUR = 19.5;

/** Named times for the developer preview. */
export const SKY_PREVIEWS: readonly { label: string; hour: number }[] = [
  { label: 'Dawn', hour: 6.5 },
  { label: 'Day', hour: 12 },
  { label: 'Golden', hour: 18.5 },
  { label: 'Dusk', hour: 19.5 },
  { label: 'Night', hour: 23 },
];

/** Warm light laid over the garden at golden hour. */
export const WARM_LIGHT = '#FFB35C';
/** The panel under Home's scene: meadow green by day, moonlit periwinkle by night. */
export const PANEL_DAY = '#DDEBB8';
export const PANEL_NIGHT = '#C6C9E3';
/** Dims the trail at night; it has no night art of its own. */
export const NIGHT_SHADE = '#141438';

export const SUN = '#FFD166';
export const SUN_GLOW = '#FFE9A8';
export const MOON = '#F5F1DC';
export const MOON_SHADOW = '#D9D2B8';
export const STAR = '#FFFBEA';
export const CLOUD = '#FFFFFF';
export const FIREFLY = '#FFF3A0';
/** The lantern gift's glow after dark. */
export const LANTERN_GLOW = '#FFD98A';
