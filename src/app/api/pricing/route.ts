import { NextResponse } from "next/server";
import { ensureInit } from "@/lib/db";
import { currentOperator } from "@/lib/auth";
import type { PricingRules } from "@/lib/types";

export async function GET() {
  const op = await currentOperator();
  if (!op) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ rules: op.rules });
}

export async function PUT(req: Request) {
  const op = await currentOperator();
  if (!op) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const incoming = (await req.json()) as PricingRules;
    // Lock operator_slug to the session — they cannot change their own slug via this endpoint.
    incoming.operator_slug = op.slug;
    const store = await ensureInit();
    await store.updateOperator({ ...op, rules: incoming, business_name: incoming.business_name || op.business_name, brand_color: incoming.brand_color || op.brand_color });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
