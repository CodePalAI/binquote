import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureInit } from "@/lib/db";
import { createSessionFor, setSessionCookie } from "@/lib/auth";
import { id, slugify } from "@/lib/id";
import { starterRules } from "@/lib/starter-rules";

const Body = z.object({
  email: z.string().email(),
  business_name: z.string().min(2).max(120),
  phone: z.string().max(40).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const store = await ensureInit();
    const existing = await store.getOperatorByEmail(body.email);
    if (existing) {
      const sid = await createSessionFor(existing.id);
      await setSessionCookie(sid);
      return NextResponse.json({ ok: true, slug: existing.slug });
    }

    // Pick a unique slug from the business name.
    const base = slugify(body.business_name);
    let candidate = base;
    let suffix = 1;
    while (await store.getOperatorBySlug(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    const opId = `op_${id(16)}`;
    const now = new Date().toISOString();
    const rules = starterRules({
      slug: candidate,
      business_name: body.business_name,
      email: body.email,
      phone: body.phone,
      brand_color: body.brand_color,
    });

    await store.createOperator({
      id: opId,
      email: body.email,
      slug: candidate,
      business_name: body.business_name,
      brand_color: body.brand_color || "#FF5A1F",
      phone: body.phone || "",
      city: body.city || "",
      state: body.state || "",
      rules,
      plan: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      created_at: now,
      updated_at: now,
    });

    const sid = await createSessionFor(opId);
    await setSessionCookie(sid);
    return NextResponse.json({ ok: true, slug: candidate });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
