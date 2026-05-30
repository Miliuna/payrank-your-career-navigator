import * as React from "react";
import type { Plan } from "@/lib/diagnostico/types";

export type Region = "LATAM" | "ESPANA" | "INTERNACIONAL";

const LATAM_COUNTRIES = new Set([
  "AR", "MX", "CL", "CO", "PE", "UY", "BO", "PY", "EC", "VE",
  "DO", "CR", "GT", "HN", "SV", "NI", "PA", "CU",
]);

export function countryToRegion(code?: string | null): Region {
  if (!code) return "INTERNACIONAL";
  const c = code.toUpperCase();
  if (LATAM_COUNTRIES.has(c)) return "LATAM";
  if (c === "ES") return "ESPANA";
  return "INTERNACIONAL";
}

export type PlanPricing = {
  amount: number; // USD
  display: string; // e.g. "USD 29"
  suffix?: string; // e.g. "/año"
  stripePriceId: string; // Stripe Price ID for this region+plan
};

// Stripe Price IDs — replace placeholders with real IDs from the Stripe dashboard.
export const PRICING: Record<Region, Record<Plan, PlanPricing>> = {
  LATAM: {
    unico: { amount: 29, display: "USD 29", stripePriceId: "price_LATAM_GO_REPLACE" },
    pack3: { amount: 69, display: "USD 69", stripePriceId: "price_LATAM_PLUS_REPLACE" },
    anual: { amount: 119, display: "USD 119", suffix: "/año", stripePriceId: "price_LATAM_PRO_REPLACE" },
  },
  ESPANA: {
    unico: { amount: 39, display: "USD 39", stripePriceId: "price_ES_GO_REPLACE" },
    pack3: { amount: 89, display: "USD 89", stripePriceId: "price_ES_PLUS_REPLACE" },
    anual: { amount: 149, display: "USD 149", suffix: "/año", stripePriceId: "price_ES_PRO_REPLACE" },
  },
  INTERNACIONAL: {
    unico: { amount: 49, display: "USD 49", stripePriceId: "price_INTL_GO_REPLACE" },
    pack3: { amount: 99, display: "USD 99", stripePriceId: "price_INTL_PLUS_REPLACE" },
    anual: { amount: 179, display: "USD 179", suffix: "/yr", stripePriceId: "price_INTL_PRO_REPLACE" },
  },
};

const STORAGE_KEY = "payrank_region";
const PLAN_SELECTION_KEY = "payrank_plan_selection";

export function persistRegion(region: Region) {
  try { localStorage.setItem(STORAGE_KEY, region); } catch {}
}

export function getStoredRegion(): Region | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "LATAM" || v === "ESPANA" || v === "INTERNACIONAL") return v;
  } catch {}
  return null;
}

export function persistPlanSelection(plan: Plan, region: Region) {
  try {
    const priceId = PRICING[region][plan].stripePriceId;
    localStorage.setItem(
      PLAN_SELECTION_KEY,
      JSON.stringify({ plan, region, priceId, amount: PRICING[region][plan].amount }),
    );
  } catch {}
}

/**
 * Detect the user's region via ipapi.co. Defaults to INTERNACIONAL on any
 * failure (network error, blocked, rate limit, unknown country, SSR).
 * Returns a stable region for the session and persists it to localStorage.
 */
export function useRegion(): { region: Region; ready: boolean } {
  const [region, setRegion] = React.useState<Region>("INTERNACIONAL");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const cached = getStoredRegion();
    if (cached) {
      setRegion(cached);
      setReady(true);
      return;
    }
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 3500);
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
        if (!res.ok) throw new Error("geo failed");
        const data = (await res.json()) as { country_code?: string };
        const r = countryToRegion(data.country_code);
        if (!cancelled) {
          setRegion(r);
          persistRegion(r);
        }
      } catch {
        if (!cancelled) {
          setRegion("INTERNACIONAL");
          persistRegion("INTERNACIONAL");
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timeout);
    };
  }, []);

  return { region, ready };
}
