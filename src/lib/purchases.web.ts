/** The web build has no store. Same surface as `purchases.ts`, all no-ops. */

export const PLUS_ENTITLEMENT = 'inhabit_plus';
export const purchasesAvailable = false;

export type PlusPlan = {
  id: string;
  title: string;
  price: string;
  period: string;
  offer: string | null;
  pkg: unknown;
};

export type BuyResult = 'bought' | 'cancelled';
type Info = { entitlements: { active: Record<string, unknown> } };

export const configurePurchases = () => false;
export const hasPlus = (info: Info | null) => !!info?.entitlements.active[PLUS_ENTITLEMENT];
export const loadPlans = async (): Promise<PlusPlan[]> => [];
export const loadCustomer = async (): Promise<Info | null> => null;
export const buyPlan = async (_plan: PlusPlan): Promise<{ result: BuyResult; info: Info | null }> => ({
  result: 'cancelled',
  info: null,
});
export const restorePurchases = async (): Promise<Info | null> => null;
export const onCustomerChange = (_listener: (info: Info) => void) => () => {};
