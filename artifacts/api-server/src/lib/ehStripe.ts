import Stripe from "stripe";

let cached: Stripe | null = null;

export function getEhStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return cached;
}

export function getEhPriceId(plan: "researcher" | "pro"): string | null {
  if (plan === "researcher") return process.env.STRIPE_PRICE_ID_RESEARCHER ?? null;
  if (plan === "pro") return process.env.STRIPE_PRICE_ID_PRO ?? null;
  return null;
}

// Spec v1.3 plan caps. -1 means unlimited.
export const EH_PLAN_LIMITS: Record<string, { responseCap: number; harvesterCap: number }> = {
  free: { responseCap: 100, harvesterCap: 1 },
  researcher: { responseCap: 1000, harvesterCap: 5 },
  pro: { responseCap: 10000, harvesterCap: -1 },
};

export function planFromPriceId(priceId: string | null | undefined): "researcher" | "pro" | "free" {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_ID_RESEARCHER) return "researcher";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  return "free";
}

export function getEhAppBaseUrl(): string {
  const fromEnv = process.env.EH_PUBLIC_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0] ?? process.env.REPLIT_DEV_DOMAIN;
  if (replitDomain) return `https://${replitDomain}`;
  return "http://localhost:5173";
}
