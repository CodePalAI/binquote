"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PricingRules, Quote, QuoteInput } from "@/lib/types";
import { formatCurrency } from "@/lib/quote-engine";

type Step = "configure" | "contact" | "success";

export function QuoteWidget({
  rules,
  apiBase = "",
  compact = false,
}: {
  rules: PricingRules;
  apiBase?: string;
  compact?: boolean;
}) {
  const [sizeId, setSizeId] = useState(rules.sizes[Math.min(2, rules.sizes.length - 1)].id);
  const [debrisType, setDebrisType] = useState(rules.debris[0].type);
  const [zip, setZip] = useState("");
  const [rentalDays, setRentalDays] = useState(
    rules.sizes.find((s) => s.id === sizeId)?.rental_days ?? 7
  );
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("configure");

  const input: QuoteInput = useMemo(
    () => ({
      size_id: sizeId,
      debris_type: debrisType,
      zip,
      rental_days: rentalDays,
    }),
    [sizeId, debrisType, zip, rentalDays]
  );

  // live recalc
  const lastReq = useRef(0);
  useEffect(() => {
    const reqId = ++lastReq.current;
    setLoading(true);
    setError(null);
    fetch(`${apiBase}/api/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operator_slug: rules.operator_slug, input }),
    })
      .then(async (r) => {
        const json = await r.json();
        if (reqId !== lastReq.current) return; // stale
        if (!r.ok) {
          setError(json?.error || "Could not calculate quote");
          setQuote(null);
        } else {
          setQuote(json.quote);
        }
      })
      .catch((e) => {
        if (reqId !== lastReq.current) return;
        setError(String(e));
      })
      .finally(() => {
        if (reqId === lastReq.current) setLoading(false);
      });
  }, [apiBase, rules.operator_slug, input]);

  // When size changes, also bump rentalDays to that size default if user hasn't customized
  const sizeBeforeRef = useRef(sizeId);
  useEffect(() => {
    if (sizeBeforeRef.current !== sizeId) {
      const newSize = rules.sizes.find((s) => s.id === sizeId);
      if (newSize) setRentalDays(newSize.rental_days);
      sizeBeforeRef.current = sizeId;
    }
  }, [sizeId, rules.sizes]);

  return (
    <div className="bg-paper text-ink border-2 border-ink shadow-hardlg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b-2 border-ink bg-ink text-paper">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: rules.brand_color }}
          />
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase">
            {rules.business_name} · Instant Quote
          </div>
        </div>
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
          {step === "success" ? "Reserved" : step === "contact" ? "Step 2/2" : "Step 1/2"}
        </div>
      </div>

      {step !== "success" && (
        <div className={`grid ${compact ? "grid-cols-1" : "md:grid-cols-[1.1fr_1fr]"} `}>
          {/* LEFT — inputs */}
          <div className="p-5 md:p-6 border-r-0 md:border-r-2 border-ink space-y-5">
            <div>
              <label className="field">Dumpster size</label>
              <div className="grid grid-cols-5 gap-1">
                {rules.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    className={`px-1 py-2 border-2 border-ink text-[12px] font-semibold tracking-tight ${
                      sizeId === s.id
                        ? "bg-ink text-paper"
                        : "bg-[#FFFCF6] hover:bg-paperdark"
                    }`}
                  >
                    {s.label.replace(" Yard", "yd")}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-sub font-mono">
                {(() => {
                  const s = rules.sizes.find((x) => x.id === sizeId)!;
                  return `${s.tons_included} tons included · ${s.rental_days}-day rental · $${s.day_overage}/day extension`;
                })()}
              </div>
            </div>

            <div>
              <label className="field">What are you tossing?</label>
              <select
                className="select"
                value={debrisType}
                onChange={(e) => setDebrisType(e.target.value as typeof debrisType)}
              >
                {rules.debris
                  .filter((d) => !d.blocked)
                  .map((d) => (
                    <option key={d.type} value={d.type}>
                      {d.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field">Delivery ZIP</label>
                <input
                  className="input tnum"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="27513"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div>
                <label className="field">Rental days</label>
                <input
                  className="input tnum"
                  type="number"
                  min={1}
                  max={60}
                  value={rentalDays}
                  onChange={(e) => setRentalDays(Math.max(1, +e.target.value || 1))}
                />
              </div>
            </div>

            {error && (
              <div className="border-2 border-safetydk bg-safety/15 px-3 py-2 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* RIGHT — live quote */}
          <div className="p-5 md:p-6 bg-paperdark/50 paper-grain">
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sub">
                Your estimate
              </div>
              {loading && (
                <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-sub">
                  calculating…
                </div>
              )}
            </div>

            <div className="font-display tracking-tightest leading-[0.9] text-[clamp(48px,9vw,84px)] font-semibold mt-1 tnum">
              {quote ? formatCurrency(quote.total, quote.currency) : "—"}
            </div>
            <div className="text-xs text-sub font-mono mt-1">
              {quote ? `${quote.size_label} · ${quote.zone_label}` : "\u00A0"}
            </div>

            <div className="dashed-rule my-4" />

            <div className="space-y-1.5 text-sm">
              {quote?.lines.map((l, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <div>
                    <div>{l.label}</div>
                    {l.note && (
                      <div className="text-[11px] text-sub">{l.note}</div>
                    )}
                  </div>
                  <div className="tnum font-mono whitespace-nowrap">
                    {l.amount < 0 ? "-" : ""}
                    {formatCurrency(Math.abs(l.amount), quote.currency)}
                  </div>
                </div>
              ))}
              {quote && quote.tax > 0 && (
                <div className="flex justify-between text-sub">
                  <div>Tax ({rules.tax_rate_pct}%)</div>
                  <div className="tnum font-mono">
                    {formatCurrency(quote.tax, quote.currency)}
                  </div>
                </div>
              )}
            </div>

            {quote && quote.warnings.length > 0 && (
              <div className="mt-3 border-l-4 border-safety pl-3 py-1 text-[12px] text-ink2">
                {quote.warnings.map((w, i) => (
                  <div key={i}>• {w}</div>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                disabled={!quote || step === "contact"}
                onClick={() => setStep("contact")}
                className="btn-safety w-full py-3 text-sm tracking-wide uppercase disabled:opacity-50"
              >
                Reserve this dumpster →
              </button>
              <a
                href={`tel:${rules.phone.replace(/[^0-9+]/g, "")}`}
                className="btn-ghost w-full py-2.5 text-sm tracking-wide text-center"
              >
                or call {rules.phone}
              </a>
            </div>

            <div className="mt-3 text-[10px] text-sub leading-snug">
              {rules.estimate_disclaimer}
            </div>
          </div>
        </div>
      )}

      {step === "contact" && quote && (
        <ContactForm
          rules={rules}
          quote={quote}
          input={input}
          apiBase={apiBase}
          onCancel={() => setStep("configure")}
          onSuccess={() => setStep("success")}
        />
      )}

      {step === "success" && (
        <SuccessPanel rules={rules} quote={quote!} />
      )}
    </div>
  );
}

function ContactForm({
  rules,
  quote,
  input,
  apiBase,
  onCancel,
  onSuccess,
}: {
  rules: PricingRules;
  quote: Quote;
  input: QuoteInput;
  apiBase: string;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const r = await fetch(`${apiBase}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_slug: rules.operator_slug,
          name,
          phone,
          email,
          address,
          notes,
          input,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Could not submit");
      onSuccess();
    } catch (e) {
      setErr(String((e as Error).message || e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-5 md:p-6 grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2 flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sub">
            Reserving
          </div>
          <div className="font-display text-3xl tnum font-semibold">
            {formatCurrency(quote.total, quote.currency)}{" "}
            <span className="text-base font-sans text-sub">· {quote.size_label}</span>
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost px-3 py-1.5 text-xs"
          onClick={onCancel}
        >
          ← Edit
        </button>
      </div>
      <div>
        <label className="field">Your name</label>
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="field">Phone</label>
        <input className="input" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" />
      </div>
      <div className="md:col-span-2">
        <label className="field">Email</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <label className="field">Delivery address</label>
        <input className="input" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Raleigh NC" />
      </div>
      <div className="md:col-span-2">
        <label className="field">Anything we should know? (optional)</label>
        <textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {err && (
        <div className="md:col-span-2 border-2 border-safetydk bg-safety/15 px-3 py-2 text-sm">
          {err}
        </div>
      )}
      <div className="md:col-span-2 flex gap-3">
        <button type="submit" disabled={submitting} className="btn-safety flex-1 py-3 text-sm uppercase tracking-wide disabled:opacity-60">
          {submitting ? "Submitting…" : "Confirm reservation"}
        </button>
      </div>
      <div className="md:col-span-2 text-[10px] text-sub leading-snug">
        {rules.permit_note}
      </div>
    </form>
  );
}

function SuccessPanel({ rules, quote }: { rules: PricingRules; quote: Quote }) {
  return (
    <div className="p-8 text-center">
      <div className="stamp mx-auto mb-4 text-leaf border-leaf">Reserved</div>
      <div className="font-display text-4xl font-semibold tracking-tightest leading-tight">
        You're on the schedule.
      </div>
      <div className="mt-2 text-sub max-w-md mx-auto">
        {rules.business_name} will text you shortly to confirm your{" "}
        <span className="font-semibold text-ink">{quote.size_label}</span> delivery for{" "}
        <span className="font-mono tnum">{formatCurrency(quote.total, quote.currency)}</span>.
      </div>
      <div className="mt-6 chip">Questions? {rules.phone}</div>
    </div>
  );
}
