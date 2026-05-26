import type {
  PricingRules,
  Quote,
  QuoteBreakdownLine,
  QuoteInput,
} from "./types";

/**
 * Pure pricing function. Same inputs => same outputs.
 *
 * Formula:
 *   subtotal = base_haul(size)
 *            + zone_delivery_fee
 *            + debris.base_adjust
 *            + overage_per_ton * max(0, est_tons + debris.tons_adjust - size.tons_included)
 *            + day_overage * max(0, rental_days - size.rental_days)
 *   total = subtotal + tax(subtotal)
 */
export function calculateQuote(
  rules: PricingRules,
  input: QuoteInput
): Quote {
  const warnings: string[] = [];
  const lines: QuoteBreakdownLine[] = [];

  const size = rules.sizes.find((s) => s.id === input.size_id);
  if (!size) {
    throw new Error(`Unknown size: ${input.size_id}`);
  }

  const debris = rules.debris.find((d) => d.type === input.debris_type);
  if (!debris) {
    throw new Error(`Unknown debris type: ${input.debris_type}`);
  }
  if (debris.blocked) {
    throw new Error(
      `${debris.label} is not accepted by ${rules.business_name}. Please call ${rules.phone}.`
    );
  }

  // Zone match by zip
  const zip = (input.zip || "").trim().slice(0, 5);
  let zone = rules.zones.find((z) => z.zips.includes(zip));
  if (!zone) {
    zone = rules.zones.find((z) => z.id === rules.default_zone_id);
    if (!zone) zone = rules.zones[0];
    if (zip.length === 5) {
      warnings.push(
        `ZIP ${zip} isn't in our usual service map — we'll confirm delivery availability before booking.`
      );
    }
  }
  if (!zone) throw new Error("No service zone configured.");

  // 1. Base haul
  lines.push({
    label: `${size.label} dumpster — base haul`,
    amount: size.base_price,
    note: `${size.tons_included} ton${size.tons_included === 1 ? "" : "s"} included · ${size.rental_days}-day rental`,
  });

  // 2. Delivery / zone
  if (zone.delivery_fee > 0) {
    lines.push({
      label: `Delivery to ${zone.label}`,
      amount: zone.delivery_fee,
    });
  }

  // 3. Debris adjustment
  if (debris.base_adjust !== 0) {
    lines.push({
      label: `${debris.label} surcharge`,
      amount: debris.base_adjust,
    });
  }

  // 4. Weight overage estimate
  const estTons =
    typeof input.estimated_tons === "number"
      ? input.estimated_tons
      : size.tons_included;
  const effectiveTons = estTons + debris.tons_adjust;
  const overTons = Math.max(0, effectiveTons - size.tons_included);
  if (overTons > 0) {
    const overageAmt = +(overTons * rules.overage_per_ton).toFixed(2);
    lines.push({
      label: `Estimated overage (${overTons.toFixed(2)} tons × $${rules.overage_per_ton}/ton)`,
      amount: overageAmt,
      note:
        "Charged only if actual weight exceeds included allowance at the scale.",
    });
  }

  // 5. Day overage
  const extraDays = Math.max(0, (input.rental_days || size.rental_days) - size.rental_days);
  if (extraDays > 0) {
    lines.push({
      label: `${extraDays} extra rental day${extraDays === 1 ? "" : "s"} × $${size.day_overage}/day`,
      amount: extraDays * size.day_overage,
    });
  }

  const subtotal = +lines.reduce((s, l) => s + l.amount, 0).toFixed(2);
  const tax =
    rules.tax_rate_pct > 0
      ? +((subtotal * rules.tax_rate_pct) / 100).toFixed(2)
      : 0;
  const total = +(subtotal + tax).toFixed(2);

  // Warnings: heavy debris in small dumpster
  if (
    (input.debris_type === "concrete" || input.debris_type === "roofing") &&
    size.tons_included < 3
  ) {
    warnings.push(
      `${debris.label} is heavy. We may recommend a larger size to avoid overage fees.`
    );
  }

  return {
    total,
    subtotal,
    tax,
    currency: rules.currency,
    lines,
    warnings,
    size_label: size.label,
    zone_label: zone.label,
  };
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
