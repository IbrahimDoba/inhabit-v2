import { useEffect, useRef, useState } from 'react';

/** Animates a displayed number toward `target`, so counters tick up instead of jumping. */
export function useCountUp(target: number, durationMs = 600) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    const began = Date.now();
    const id = setInterval(() => {
      const t = Math.min((Date.now() - began) / durationMs, 1);
      const value = Math.round(start + (target - start) * (1 - (1 - t) ** 3));
      setShown(value);
      if (t === 1) {
        from.current = target;
        clearInterval(id);
      }
    }, 30);
    return () => {
      clearInterval(id);
      from.current = target;
    };
  }, [target, durationMs]);

  return shown;
}
