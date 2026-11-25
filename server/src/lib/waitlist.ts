/** Small pure helpers for the waitlist form, kept apart from the database so they can be tested. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A trimmed, lower-cased address, or null when it does not look like one. */
export function cleanEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const email = input.trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return null;
  return email;
}

/** True for the values a checkbox or a JSON body can send for "yes". */
export function isYes(input: unknown): boolean {
  return input === true || input === 'on' || input === 'true' || input === '1';
}

/**
 * Allows `limit` calls per `windowMs` for each key (an IP address), in memory.
 * Enough to stop one machine filling the list; it resets when the server restarts.
 */
export function rateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const t = now();
    const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(t);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.every((at) => t - at >= windowMs)) hits.delete(k);
    }
    return true;
  };
}

/** One CSV cell, quoted, with spreadsheet formulas defused. */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
