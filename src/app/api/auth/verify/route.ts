import { NextResponse } from "next/server";
import {
  consumeMagicLink,
  createSessionFor,
  setSessionCookie,
} from "@/lib/auth";
import { ensureInit } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const result = await consumeMagicLink(token);
  if (!result) {
    return NextResponse.redirect(new URL("/login?error=expired", url.origin));
  }
  const store = await ensureInit();
  const op = await store.getOperatorByEmail(result.email);

  if (!op) {
    // Pass the verified email forward to the signup flow.
    const dest = new URL("/signup", url.origin);
    dest.searchParams.set("email", result.email);
    dest.searchParams.set("verified", "1");
    return NextResponse.redirect(dest);
  }

  const sid = await createSessionFor(op.id);
  await setSessionCookie(sid);
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
