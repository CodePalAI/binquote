import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureInit } from "@/lib/db";
import { currentOperator } from "@/lib/auth";

const Body = z.object({
  status: z.enum(["new", "contacted", "booked", "lost"]),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const op = await currentOperator();
  if (!op) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const body = Body.parse(await req.json());
    const store = await ensureInit();
    await store.updateLeadStatus(op.id, Number(id), body.status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
