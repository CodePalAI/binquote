import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureInit } from "@/lib/db";
import { calculateQuote } from "@/lib/quote-engine";
import { sendEmail, newLeadEmail } from "@/lib/email";
import { currentOperator } from "@/lib/auth";
import { ensureDemoOperator, DEMO_SLUG } from "@/lib/demo-seed";

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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    if (body.operator_slug === DEMO_SLUG) await ensureDemoOperator();
    const store = await ensureInit();
    const op = await store.getOperatorBySlug(body.operator_slug);
    if (!op) return NextResponse.json({ error: "Unknown operator" }, { status: 404, headers: CORS });

    const quote = calculateQuote(op.rules, body.input);
    const referer = req.headers.get("referer") || "";
    const lead = await store.insertLead({
      operator_id: op.id,
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

    const origin = new URL(req.url).origin;
    if (op.slug !== DEMO_SLUG) {
      const debrisLabel =
        op.rules.debris.find((d) => d.type === body.input.debris_type)?.label ??
        body.input.debris_type;
      const tpl = newLeadEmail({
        business: op.business_name,
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        total: quote.total,
        sizeLabel: quote.size_label,
        debrisLabel,
        rentalDays: body.input.rental_days,
        notes: body.notes,
        dashboardUrl: `${origin}/dashboard/leads?lead=${lead.id}`,
      });
      sendEmail({ to: op.email, replyTo: body.email, ...tpl }).catch((err) =>
        console.error("[email] new-lead notify failed:", err)
      );
    }

    return NextResponse.json({ lead }, { headers: CORS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400, headers: CORS });
  }
}

export async function GET() {
  const op = await currentOperator();
  if (!op) return NextResponse.json({ leads: [], error: "unauthorized" }, { status: 401 });
  const store = await ensureInit();
  const leads = await store.listLeads(op.id);
  return NextResponse.json({ leads });
}

export const OPTIONS = () => new NextResponse(null, { status: 204, headers: CORS });
