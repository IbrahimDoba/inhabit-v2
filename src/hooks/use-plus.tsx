import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  buyPlan,
  hasPlus,
  loadCustomer,
  loadPlans,
  onCustomerChange,
  purchasesAvailable,
  restorePurchases,
  type PlusPlan,
} from '@/lib/purchases';
import { loadSaved, save } from '@/lib/storage';

const DEV_KEY = 'inhabit.devPlus';

type PlusContextValue = {
  /** DragonDen Plus is active (or pretended, in development). */
  isPlus: boolean;
  /** False when this build has no store key: nothing can be bought. */
  available: boolean;
  /** `null` while loading; empty if the store has nothing to offer. */
  plans: PlusPlan[] | null;
  /** Resolves true once Plus is active. Throws with the store's message on a real error. */
  buy: (plan: PlusPlan) => Promise<boolean>;
  /** Resolves true if a past purchase was found. */
  restore: () => Promise<boolean>;
  /** Dev only: pretend to be a member without the store. */
  devPlus: boolean;
  setDevPlus: (on: boolean) => void;
};

const PlusContext = createContext<PlusContextValue | null>(null);

/** Knows whether DragonDen Plus is active, and sells it. */
export function PlusProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState(false);
  const [plans, setPlans] = useState<PlusPlan[] | null>(purchasesAvailable ? null : []);
  const [devPlus, setDev] = useState(() => (__DEV__ ? loadSaved<boolean>(DEV_KEY, 1) === true : false));

  useEffect(() => {
    if (!purchasesAvailable) return;
    let cancelled = false;
    loadCustomer()
      .then((info) => !cancelled && setMember(hasPlus(info)))
      .catch(() => {
        // Offline or the store is unreachable; the listener catches up later.
      });
    loadPlans()
      .then((found) => !cancelled && setPlans(found))
      .catch(() => !cancelled && setPlans([]));
    const stop = onCustomerChange((info) => setMember(hasPlus(info)));
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  const buy = useCallback(async (plan: PlusPlan) => {
    const { result, info } = await buyPlan(plan);
    if (result === 'cancelled') return false;
    const active = hasPlus(info);
    setMember(active);
    return active;
  }, []);

  const restore = useCallback(async () => {
    const active = hasPlus(await restorePurchases());
    setMember(active);
    return active;
  }, []);

  const setDevPlus = useCallback((on: boolean) => {
    setDev(on);
    save(DEV_KEY, 1, on);
  }, []);

  const value = useMemo<PlusContextValue>(
    () => ({
      isPlus: member || devPlus,
      available: purchasesAvailable,
      plans,
      buy,
      restore,
      devPlus,
      setDevPlus,
    }),
    [member, devPlus, plans, buy, restore, setDevPlus],
  );

  return <PlusContext.Provider value={value}>{children}</PlusContext.Provider>;
}

export function usePlus() {
  const context = useContext(PlusContext);
  if (!context) throw new Error('usePlus must be used inside PlusProvider');
  return context;
}
