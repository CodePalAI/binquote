import { NextResponse } from "next/server";
import { getOperator, saveOperator } from "@/lib/db";
import type { PricingRules } from "@/lib/types";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("op") || "";
  const rules = getOperator(slug);
  if (!rules) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ rules });
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as PricingRules;
    if (!body?.operator_slug) {
      return NextResponse.json({ error: "missing operator_slug" }, { status: 400 });
    }
    saveOperator(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad request" },
      { status: 400 }
    );
  }
}
