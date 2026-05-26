// Email service. Resend in prod, console-print in dev.

import { Resend } from "resend";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

let client: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export function fromAddress(): string {
  return process.env.EMAIL_FROM || "BinQuote <onboarding@resend.dev>";
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string }> {
  const c = getClient();
  if (!c) {
    // Dev mode: log to server console so the developer can copy the magic link.
    console.log("\n────── ✉  DEV EMAIL ──────");
    console.log("to:     ", args.to);
    console.log("subject:", args.subject);
    if (args.text) console.log(args.text);
    else console.log(args.html.replace(/<[^>]+>/g, "").trim().slice(0, 800));
    console.log("──────────────────────────\n");
    return { ok: true, id: "dev-mode" };
  }
  const res = await c.emails.send({
    from: fromAddress(),
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    replyTo: args.replyTo,
  });
  return { ok: !res.error, id: res.data?.id };
}

export function magicLinkEmail(opts: { url: string; expiresMinutes: number }): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Your BinQuote sign-in link",
    text: `Sign in to BinQuote:\n${opts.url}\n\nThis link expires in ${opts.expiresMinutes} minutes.`,
    html: `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F4EFE6;padding:32px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #16110D;padding:32px;">
        <div style="font-family:Georgia,serif;font-size:32px;color:#16110D;letter-spacing:-0.02em;">BinQuote</div>
        <div style="height:2px;background:#16110D;margin:16px 0 24px;"></div>
        <p style="font-size:16px;color:#16110D;line-height:1.5;margin:0 0 24px;">Click the button below to sign in. The link expires in ${opts.expiresMinutes} minutes.</p>
        <a href="${opts.url}" style="display:inline-block;background:#FF5A1F;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border:2px solid #16110D;box-shadow:4px 4px 0 #16110D;">Sign in to BinQuote →</a>
        <p style="font-size:13px;color:#6B6157;margin:32px 0 0;">If the button doesn't work, paste this URL into your browser:<br/><span style="word-break:break-all;color:#16110D;">${opts.url}</span></p>
      </div>
    </body></html>`,
  };
}

export function newLeadEmail(opts: {
  business: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  total: number;
  sizeLabel: string;
  debrisLabel: string;
  rentalDays: number;
  notes: string;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const money = `$${opts.total.toFixed(2)}`;
  return {
    subject: `New ${money} quote request — ${opts.name}`,
    text: `New quote request for ${opts.business}\n\n${opts.name}\n${opts.phone}\n${opts.email}\n${opts.address}\n\n${opts.sizeLabel} · ${opts.debrisLabel} · ${opts.rentalDays} days\nQuote total: ${money}\n\nNotes: ${opts.notes || "—"}\n\nView in dashboard: ${opts.dashboardUrl}`,
    html: `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F4EFE6;padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:2px solid #16110D;">
        <div style="background:#FF5A1F;color:#fff;padding:20px 28px;border-bottom:2px solid #16110D;">
          <div style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;">New lead</div>
          <div style="font-family:Georgia,serif;font-size:28px;font-weight:700;margin-top:4px;">${money} · ${opts.name}</div>
        </div>
        <div style="padding:24px 28px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#16110D;">
            <tr><td style="padding:6px 0;color:#6B6157;width:120px;">Phone</td><td><a href="tel:${opts.phone}" style="color:#16110D;text-decoration:none;font-weight:600;">${opts.phone}</a></td></tr>
            <tr><td style="padding:6px 0;color:#6B6157;">Email</td><td><a href="mailto:${opts.email}" style="color:#16110D;text-decoration:none;">${opts.email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#6B6157;">Address</td><td>${opts.address}</td></tr>
            <tr><td style="padding:6px 0;color:#6B6157;">Job</td><td>${opts.sizeLabel} · ${opts.debrisLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#6B6157;">Rental</td><td>${opts.rentalDays} days</td></tr>
            ${opts.notes ? `<tr><td style="padding:6px 0;color:#6B6157;vertical-align:top;">Notes</td><td>${opts.notes}</td></tr>` : ""}
          </table>
          <div style="margin-top:24px;">
            <a href="${opts.dashboardUrl}" style="display:inline-block;background:#16110D;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border:2px solid #16110D;box-shadow:4px 4px 0 #FF5A1F;">Open in BinQuote →</a>
          </div>
        </div>
      </div>
    </body></html>`,
  };
}
