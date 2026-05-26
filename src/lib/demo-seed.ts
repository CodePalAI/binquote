// Idempotent seeder for the public-facing /demo experience.
// Creates the "ironside-hauling" operator if missing, with a few sample leads.

import { ensureInit } from "./db";
import { defaultRules } from "./seed-defaults";
import { calculateQuote } from "./quote-engine";
import type { DebrisType, Lead } from "./types";

const DEMO_OPERATOR_ID = "demo_ironside_hauling";
export const DEMO_SLUG = "ironside-hauling";

export async function ensureDemoOperator() {
  const store = await ensureInit();
  const existing = await store.getOperatorBySlug(DEMO_SLUG);
  if (existing) return existing;

  const op = {
    id: DEMO_OPERATOR_ID,
    email: "demo@binquote.app",
    slug: DEMO_SLUG,
    business_name: defaultRules.business_name,
    brand_color: defaultRules.brand_color,
    phone: defaultRules.phone,
    city: "Raleigh",
    state: "NC",
    rules: defaultRules,
    plan: "pro" as const,
    trial_ends_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await store.createOperator(op);
  await seedSampleLeads();
  return op;
}

async function seedSampleLeads() {
  const store = await ensureInit();
  const samples: Array<{
    minutes_ago: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    size_id: string;
    debris_type: DebrisType;
    rental_days: number;
    estimated_tons?: number;
    status: Lead["status"];
  }> = [
    {
      minutes_ago: 14,
      name: "Marcus Whitfield",
      phone: "919-555-0142",
      email: "marcus@whitfieldbuilds.com",
      address: "812 Oberlin Rd, Raleigh NC 27605",
      notes: "Kitchen + bath gut, drop Friday AM.",
      size_id: "20yd",
      debris_type: "construction",
      rental_days: 7,
      estimated_tons: 3,
      status: "new",
    },
    {
      minutes_ago: 96,
      name: "Priya Shah",
      phone: "984-555-0188",
      email: "priya.shah@gmail.com",
      address: "401 Brookside Dr, Raleigh NC 27604",
      notes: "Garage cleanout, mostly boxes.",
      size_id: "15yd",
      debris_type: "household",
      rental_days: 5,
      status: "contacted",
    },
    {
      minutes_ago: 240,
      name: "Cedar Ridge Roofing",
      phone: "919-555-0177",
      email: "ops@cedarridgeroofing.com",
      address: "227 N Person St, Raleigh NC 27601",
      notes: "Tear-off, 3,200 sq ft, asphalt shingles.",
      size_id: "30yd",
      debris_type: "roofing",
      rental_days: 3,
      estimated_tons: 4,
      status: "booked",
    },
  ];

  for (const s of samples) {
    const quote = calculateQuote(defaultRules, {
      size_id: s.size_id,
      debris_type: s.debris_type,
      zip: s.address.match(/(\d{5})/)?.[1] ?? "",
      rental_days: s.rental_days,
      estimated_tons: s.estimated_tons,
    });
    const lead = await store.insertLead({
      operator_id: DEMO_OPERATOR_ID,
      name: s.name,
      phone: s.phone,
      email: s.email,
      address: s.address,
      zip: s.address.match(/(\d{5})/)?.[1] ?? "",
      notes: s.notes,
      size_id: s.size_id,
      debris_type: s.debris_type,
      rental_days: s.rental_days,
      quote_total: quote.total,
      quote_json: JSON.stringify(quote),
      source_url: "https://ironside-hauling.example.com/dumpster-rental",
    });
    if (s.status !== "new") {
      await store.updateLeadStatus(DEMO_OPERATOR_ID, lead.id, s.status);
    }
  }
}
