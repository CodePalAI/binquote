// Magic-link auth + session cookie helpers. Used by server components and API routes.

import { cookies } from "next/headers";
import { ensureInit } from "./db";
import { id } from "./id";
import type { Operator } from "./db/types";

export const SESSION_COOKIE = "binquote_session";
const TOKEN_TTL_MIN = 20;
const SESSION_TTL_DAYS = 30;

export type MagicLinkResult =
  | { ok: true; token: string; url: string; demoMode: boolean }
  | { ok: false; error: string };

export async function startMagicLink(opts: {
  email: string;
  origin: string;
}): Promise<MagicLinkResult> {
  const email = opts.email.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Enter a valid email." };

  const store = await ensureInit();
  const token = id(28);
  const expires = new Date(Date.now() + TOKEN_TTL_MIN * 60_000).toISOString();
  await store.createMagicToken({ token, email, expires_at: expires, consumed_at: null });

  const url = `${opts.origin}/api/auth/verify?token=${token}`;
  return { ok: true, token, url, demoMode: !process.env.RESEND_API_KEY };
}

export async function consumeMagicLink(token: string): Promise<{ email: string } | null> {
  const store = await ensureInit();
  const t = await store.consumeMagicToken(token);
  if (!t) return null;
  return { email: t.email };
}

export async function createSessionFor(operatorId: string): Promise<string> {
  const store = await ensureInit();
  const sid = id(32);
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000).toISOString();
  await store.createSession({ id: sid, operator_id: operatorId, expires_at: expires });
  return sid;
}

export async function setSessionCookie(sid: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function currentOperator(): Promise<Operator | null> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  const store = await ensureInit();
  const session = await store.getSession(sid);
  if (!session) return null;
  return store.getOperatorById(session.operator_id);
}

export async function requireOperator(): Promise<Operator> {
  const op = await currentOperator();
  if (!op) throw new Error("UNAUTHORIZED");
  return op;
}
