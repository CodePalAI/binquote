export type DebrisType =
  | "household"
  | "construction"
  | "concrete"
  | "roofing"
  | "yard"
  | "mixed_heavy";

export type DumpsterSize = {
  id: string;            // "10yd"
  label: string;         // "10 Yard"
  base_price: number;    // base haul fee, includes delivery + pickup + tipping for included tons
  tons_included: number; // weight allowance
  rental_days: number;   // days included
  day_overage: number;   // $/day past rental_days
  max_capacity_lbs?: number;
};

export type DebrisModifier = {
  type: DebrisType;
  label: string;
  base_adjust: number;     // flat $ added (or subtracted, can be negative)
  tons_adjust: number;     // effective tons added per "load" estimate (heavy debris fills weight before volume)
  blocked?: boolean;       // operator forbids this debris type
};

export type ServiceZone = {
  id: string;
  label: string;          // "Inside city"
  zips: string[];         // ["27513","27511"]
  delivery_fee: number;   // additional $ on top of base_price
};

export type PricingRules = {
  operator_slug: string;
  business_name: string;
  phone: string;
  email: string;
  brand_color: string;     // hex
  currency: string;        // "USD"
  overage_per_ton: number; // $/ton over tons_included
  estimate_disclaimer: string;
  permit_note: string;
  sizes: DumpsterSize[];
  debris: DebrisModifier[];
  zones: ServiceZone[];
  default_zone_id: string; // used when zip not matched
  show_price_to_visitor: boolean; // if false, require contact info first
  tax_rate_pct: number;    // e.g. 7.25 (added at end), 0 disables
};

export type QuoteInput = {
  size_id: string;
  debris_type: DebrisType;
  zip: string;
  rental_days: number;
  estimated_tons?: number; // optional, defaults to size.tons_included
};

export type QuoteBreakdownLine = {
  label: string;
  amount: number;
  note?: string;
};

export type Quote = {
  total: number;
  subtotal: number;
  tax: number;
  currency: string;
  lines: QuoteBreakdownLine[];
  warnings: string[];
  size_label: string;
  zone_label: string;
};

export type Lead = {
  id: number;
  operator_slug: string;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  notes: string;
  size_id: string;
  debris_type: string;
  rental_days: number;
  quote_total: number;
  quote_json: string;
  source_url: string;
  status: "new" | "contacted" | "booked" | "lost";
};
