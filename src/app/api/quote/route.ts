import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureInit } from "@/lib/db";
import { calculateQuote } from "@/lib/quote-engine";
import { ensureDemoOperator, DEMO_SLUG } from "@/lib/demo-seed";

const Body = z.object({
  operator_slug: z.string().min(1),
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
    return NextResponse.json({ quote }, { headers: CORS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400, headers: CORS });
  }
}

export const OPTIONS = () => new NextResponse(null, { status: 204, headers: CORS });
