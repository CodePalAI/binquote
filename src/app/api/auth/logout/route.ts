import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureInit } from "@/lib/db";
import { SESSION_COOKIE, clearSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (sid) {
    const store = await ensureInit();
    await store.deleteSession(sid);
  }
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/", new URL(req.url).origin));
}
