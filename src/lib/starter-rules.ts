// Starter pricing rules for a newly-signed-up operator. They edit these in onboarding.

import type { PricingRules } from "./types";

export function starterRules(opts: {
  slug: string;
  business_name: string;
  email: string;
  phone?: string;
  brand_color?: string;
}): PricingRules {
  return {
    operator_slug: opts.slug,
    business_name: opts.business_name,
    phone: opts.phone || "",
    email: opts.email,
    brand_color: opts.brand_color || "#FF5A1F",
    currency: "USD",
    overage_per_ton: 75,
    estimate_disclaimer:
      "This is a firm estimate based on the info you provided. Final price is confirmed at delivery if debris weight, size, or rental period differs.",
    permit_note:
      "Street placement may require a city permit. We'll let you know before delivery if one is needed.",
    tax_rate_pct: 0,
    show_price_to_visitor: true,
    default_zone_id: "local",
    sizes: [
      { id: "10yd", label: "10 Yard", base_price: 325, tons_included: 2, rental_days: 7, day_overage: 15 },
      { id: "15yd", label: "15 Yard", base_price: 395, tons_included: 2, rental_days: 7, day_overage: 15 },
      { id: "20yd", label: "20 Yard", base_price: 465, tons_included: 3, rental_days: 10, day_overage: 20 },
      { id: "30yd", label: "30 Yard", base_price: 575, tons_included: 4, rental_days: 10, day_overage: 20 },
      { id: "40yd", label: "40 Yard", base_price: 695, tons_included: 5, rental_days: 10, day_overage: 25 },
    ],
    debris: [
      { type: "household", label: "Household junk", base_adjust: 0, tons_adjust: 0 },
      { type: "construction", label: "Construction & demolition", base_adjust: 25, tons_adjust: 0.5 },
      { type: "roofing", label: "Roofing shingles", base_adjust: 35, tons_adjust: 1.0 },
      { type: "concrete", label: "Clean concrete/brick", base_adjust: -25, tons_adjust: 2.0 },
      { type: "yard", label: "Yard waste", base_adjust: 0, tons_adjust: -0.5 },
      { type: "mixed_heavy", label: "Mixed heavy debris", base_adjust: 50, tons_adjust: 1.0 },
    ],
    zones: [
      { id: "local", label: "Local service area", zips: [], delivery_fee: 0 },
      { id: "extended", label: "Extended service area", zips: [], delivery_fee: 75 },
    ],
  };
}
