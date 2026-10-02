import { NIGHT_ENDS_HOUR, NIGHT_STARTS_HOUR } from './rules';

/** Local calendar day as `YYYY-MM-DD`. Energy and streaks reset when this changes. */
export function dayKey(now: number): string {
  const d = new Date(now);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Whole local days from `from` to `to` (both day keys). Safe across daylight-saving changes. */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

export function isNight(now: number): boolean {
  const hour = new Date(now).getHours();
  return hour >= NIGHT_STARTS_HOUR || hour < NIGHT_ENDS_HOUR;
}

export const HOUR = 3_600_000;
