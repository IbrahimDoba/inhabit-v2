import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Style = 'light' | 'dark';

type StatusBarContextValue = {
  /** A screen's requested style, or `null` to follow the colour scheme. */
  override: Style | null;
  setOverride: (style: Style | null) => void;
};

const StatusBarContext = createContext<StatusBarContextValue | null>(null);

/**
 * One status bar for the app, owned by the root layout. Screens drawn on art
 * (Home's sky) ask for a style while focused, instead of mounting their own
 * status bar, which the root's would otherwise override.
 */
export function StatusBarProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<Style | null>(null);
  const value = useMemo(() => ({ override, setOverride }), [override]);
  return <StatusBarContext.Provider value={value}>{children}</StatusBarContext.Provider>;
}

export function useStatusBarOverride() {
  const context = useContext(StatusBarContext);
  if (!context) throw new Error('useStatusBarOverride must be used inside StatusBarProvider');
  return context;
}
