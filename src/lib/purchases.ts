/**
 * In-app purchases through RevenueCat. One subscription, Inhabit Plus, unlocked
 * by the `plus` entitlement.
 *
 * The public SDK keys come from `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and
 * `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`. Without a key (web, or a build made
 * before the store is set up) every call here is a quiet no-op and the paywall
 * says purchases are not available yet.
 */

import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

/** The entitlement id set up in the RevenueCat dashboard. */
export const PLUS_ENTITLEMENT = 'plus';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  default: undefined,
});

/** Whether this build can talk to the store at all. */
export const purchasesAvailable = !!API_KEY;

export type PlusPlan = {
  id: string;
  /** "Yearly", "Monthly" and so on. */
  title: string;
  /** The store's own localised price, such as "$29.99". */
  price: string;
  /** "per year", "per month", or empty for a one-time purchase. */
  period: string;
  /** A free trial or intro offer in words, when the store offers one. */
  offer: string | null;
  pkg: PurchasesPackage;
};

let configured = false;

/** Safe to call more than once. Returns false when there is no key. */
export function configurePurchases(): boolean {
  if (!API_KEY) return false;
  if (!configured) {
    Purchases.configure({ apiKey: API_KEY });
    configured = true;
  }
  return true;
}

export function hasPlus(info: CustomerInfo | null): boolean {
  return !!info?.entitlements.active[PLUS_ENTITLEMENT];
}

const PACKAGE_WORDS: Record<string, { title: string; period: string }> = {
  ANNUAL: { title: 'Yearly', period: 'per year' },
  SIX_MONTH: { title: 'Six months', period: 'every 6 months' },
  THREE_MONTH: { title: 'Three months', period: 'every 3 months' },
  TWO_MONTH: { title: 'Two months', period: 'every 2 months' },
  MONTHLY: { title: 'Monthly', period: 'per month' },
  WEEKLY: { title: 'Weekly', period: 'per week' },
  LIFETIME: { title: 'Lifetime', period: 'once' },
};

const UNIT_WORDS: Record<string, string> = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' };

function offerWords(pkg: PurchasesPackage): string | null {
  const intro = pkg.product.introPrice;
  if (!intro) return null;
  const unit = UNIT_WORDS[intro.periodUnit] ?? intro.periodUnit.toLowerCase();
  const length = `${intro.periodNumberOfUnits} ${unit}${intro.periodNumberOfUnits === 1 ? '' : 's'}`;
  return intro.price === 0 ? `${length} free, then` : `${intro.priceString} for the first ${length}, then`;
}

/** The plans in the current offering, in the order the dashboard lists them. */
export async function loadPlans(): Promise<PlusPlan[]> {
  if (!configurePurchases()) return [];
  const offerings = await Purchases.getOfferings();
  return (offerings.current?.availablePackages ?? []).map((pkg) => {
    const words = PACKAGE_WORDS[pkg.packageType] ?? { title: pkg.product.title, period: '' };
    return {
      id: pkg.identifier,
      title: words.title,
      price: pkg.product.priceString,
      period: words.period,
      offer: offerWords(pkg),
      pkg,
    };
  });
}

export async function loadCustomer(): Promise<CustomerInfo | null> {
  if (!configurePurchases()) return null;
  return Purchases.getCustomerInfo();
}

export type BuyResult = 'bought' | 'cancelled';

/** Buys a plan. Resolves `cancelled` if the person backs out; throws on a real error. */
export async function buyPlan(plan: PlusPlan): Promise<{ result: BuyResult; info: CustomerInfo | null }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    return { result: 'bought', info: customerInfo };
  } catch (error) {
    if ((error as { userCancelled?: boolean | null }).userCancelled) {
      return { result: 'cancelled', info: null };
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!configurePurchases()) return null;
  return Purchases.restorePurchases();
}

/** Calls back whenever the store reports a change, such as a renewal or a refund. */
export function onCustomerChange(listener: (info: CustomerInfo) => void): () => void {
  if (!configurePurchases()) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}
