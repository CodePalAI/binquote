import { NextResponse } from "next/server";
import { updateLeadStatus } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { status } = await req.json();
    if (!["new", "contacted", "booked", "lost"].includes(status)) {
      return NextResponse.json({ error: "bad status" }, { status: 400 });
    }
    updateLeadStatus(+id, status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad" },
      { status: 400 }
    );
  }
}
