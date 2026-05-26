import { NextResponse } from "next/server";
import { z } from "zod";
import { getOperator, insertLead, listLeads } from "@/lib/db";
import { calculateQuote } from "@/lib/quote-engine";

const Body = z.object({
  operator_slug: z.string(),
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(40),
  email: z.string().email(),
  address: z.string().min(2).max(300),
  notes: z.string().max(2000).default(""),
  input: z.object({
    size_id: z.string(),
    debris_type: z.enum([
      "household",
      "construction",
      "concrete",
      "roofing",
      "yard",
      "mixed_heavy",
    ]),
    zip: z.string().default(""),
    rental_days: z.number().int().min(1).max(60),
    estimated_tons: z.number().min(0).max(50).optional(),
  }),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const rules = getOperator(body.operator_slug);
    if (!rules) {
      return NextResponse.json({ error: "Unknown operator" }, { status: 404 });
    }
    const quote = calculateQuote(rules, body.input);
    const referer = req.headers.get("referer") || "";
    const lead = insertLead({
      operator_slug: body.operator_slug,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      zip: body.input.zip,
      notes: body.notes,
      size_id: body.input.size_id,
      debris_type: body.input.debris_type,
      rental_days: body.input.rental_days,
      quote_total: quote.total,
      quote_json: JSON.stringify(quote),
      source_url: referer,
    });
    return NextResponse.json({ lead });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("op") || "";
  if (!slug) return NextResponse.json({ leads: [] });
  return NextResponse.json({ leads: listLeads(slug) });
}
