import { NextResponse } from "next/server";
import { z } from "zod";
import { startMagicLink } from "@/lib/auth";
import { sendEmail, magicLinkEmail } from "@/lib/email";
import { ensureInit } from "@/lib/db";

const Body = z.object({
  email: z.string().email(),
  intent: z.enum(["signup", "login"]).default("login"),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const store = await ensureInit();
    const existing = await store.getOperatorByEmail(body.email);

    if (body.intent === "login" && !existing) {
      return NextResponse.json({ error: "No account with that email. Sign up first." }, { status: 404 });
    }

    const origin = new URL(req.url).origin;
    const result = await startMagicLink({ email: body.email, origin });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const tpl = magicLinkEmail({ url: result.url, expiresMinutes: 20 });
    await sendEmail({ to: body.email, ...tpl });

    return NextResponse.json({
      ok: true,
      // In dev mode (no RESEND key) we surface the link so the developer can click it.
      dev_link: result.demoMode ? result.url : null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
