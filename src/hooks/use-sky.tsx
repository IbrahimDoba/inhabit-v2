import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { now, useClockOffset } from '@/lib/clock';
import { hourOf, skyAt, type SkyState } from '@/lib/sky';

type SkyContextValue = {
  sky: SkyState;
  /** Dev only: pin the sky to an hour, or `null` to follow the clock. */
  previewHour: number | null;
  setPreviewHour: (hour: number | null) => void;
};

const SkyContext = createContext<SkyContextValue | null>(null);

/** The current sky, following the app clock (checked every minute and whenever it is moved). */
export function SkyProvider({ children }: { children: ReactNode }) {
  const offset = useClockOffset();
  const [clockHour, setClockHour] = useState(() => hourOf(new Date(now())));
  const [previewHour, setPreviewHour] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setClockHour(hourOf(new Date(now())));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [offset]);

  const value = useMemo(
    () => ({ sky: skyAt(previewHour ?? clockHour), previewHour, setPreviewHour }),
    [clockHour, previewHour],
  );

  return <SkyContext.Provider value={value}>{children}</SkyContext.Provider>;
}

export function useSky() {
  const context = useContext(SkyContext);
  if (!context) throw new Error('useSky must be used inside SkyProvider');
  return context;
}
