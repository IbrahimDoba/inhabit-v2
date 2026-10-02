import { useEffect, useState } from 'react';

import { now as clockNow, useClockOffset } from '@/lib/clock';

/**
 * The app's current time, ticking every `intervalMs` while `active`. Always
 * catches up when the developer clock is moved, even when not ticking.
 */
export function useNow(active = true, intervalMs = 1000) {
  const offset = useClockOffset();
  const [now, setNow] = useState(clockNow);

  useEffect(() => {
    const tick = () => setNow(clockNow());
    // Catch up straight away: the value may be stale, or the clock just moved.
    const first = setTimeout(tick, 0);
    const id = active ? setInterval(tick, intervalMs) : undefined;
    return () => {
      clearTimeout(first);
      if (id) clearInterval(id);
    };
  }, [active, intervalMs, offset]);

  return now;
}
