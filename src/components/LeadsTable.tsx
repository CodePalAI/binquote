"use client";

import { useState } from "react";
import type { Lead, Quote } from "@/lib/types";
import { formatCurrency } from "@/lib/quote-engine";
import { ChevronRight } from "lucide-react";

const STATUSES: Lead["status"][] = ["new", "contacted", "booked", "lost"];

export default function LeadsTable({
  initialLeads,
}: {
  initialLeads: Lead[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<"all" | Lead["status"]>("all");
  const [openId, setOpenId] = useState<number | null>(initialLeads[0]?.id ?? null);

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const open = leads.find((l) => l.id === openId) ?? filtered[0];
  const quote: Quote | null = open ? safeParse(open.quote_json) : null;

  async function refresh() {
    const r = await fetch(`/api/leads`);
    const j = await r.json();
    setLeads(j.leads || []);
  }

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
      <div className="border-2 border-ink bg-[#FFFCF6]">
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
          <div className="flex gap-1">
            {(["all", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border-2 ${
                  filter === s ? "bg-ink text-paper border-ink" : "border-ink/30 text-sub hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={refresh} className="btn-ghost px-2.5 py-1 text-[11px]">Refresh</button>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sub">
            No leads yet. Submit a test quote from the{" "}
            <a className="underline" href="/">landing page</a>.
          </div>
        ) : (
          <ul className="divide-y-2 divide-ink/10">
            {filtered.map((l) => (
              <li
                key={l.id}
                onClick={() => setOpenId(l.id)}
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 ${
                  open?.id === l.id ? "bg-paperdark" : "hover:bg-paperdark/40"
                }`}
              >
                <StatusDot status={l.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-semibold truncate">{l.name}</div>
                    <div className="font-mono text-xs text-sub shrink-0">{relTime(l.created_at)}</div>
                  </div>
                  <div className="text-xs text-sub truncate font-mono">
                    {l.size_id} · {l.debris_type} · {l.zip} · {formatCurrency(l.quote_total)}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-sub shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sticky top-6 border-2 border-ink bg-paper shadow-hardlg">
        {open ? (
          <LeadDetail lead={open} quote={quote} onChanged={refresh} />
        ) : (
          <div className="p-8 text-sub text-sm">Select a lead.</div>
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: Lead["status"] }) {
  const color =
    status === "new"
      ? "#FF5A1F"
      : status === "contacted"
      ? "#16110D"
      : status === "booked"
      ? "#3A4A2A"
      : "#6E6253";
  return <div className="w-2.5 h-2.5 border border-ink" style={{ background: color }} />;
}

function LeadDetail({
  lead,
  quote,
  onChanged,
}: {
  lead: Lead;
  quote: Quote | null;
  onChanged: () => void;
}) {
  async function setStatus(s: Lead["status"]) {
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    onChanged();
  }

  return (
    <div>
      <div className="p-5 border-b-2 border-ink">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sub">Lead #{lead.id}</div>
        <div className="font-display text-3xl font-semibold tracking-tightest mt-1 leading-tight">
          {lead.name}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <a className="chip" href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}>
            {lead.phone}
          </a>
          <a className="chip" href={`mailto:${lead.email}`}>{lead.email}</a>
        </div>
        <div className="mt-2 text-sm">{lead.address}</div>
        {lead.notes && (
          <div className="mt-3 border-l-4 border-safety pl-3 text-sm">{lead.notes}</div>
        )}
      </div>
      <div className="p-5 border-b-2 border-ink space-y-1 text-sm">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sub mb-2">Quote</div>
        {quote?.lines.map((l, i) => (
          <div key={i} className="flex justify-between">
            <span>{l.label}</span>
            <span className="tnum font-mono">{formatCurrency(l.amount)}</span>
          </div>
        ))}
        {quote && quote.tax > 0 && (
          <div className="flex justify-between text-sub">
            <span>Tax</span>
            <span className="tnum font-mono">{formatCurrency(quote.tax)}</span>
          </div>
        )}
        <div className="dashed-rule my-2" />
        <div className="flex justify-between font-display text-2xl font-semibold">
          <span>Total</span>
          <span className="tnum">{formatCurrency(lead.quote_total)}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sub mb-2">Set status</div>
        <div className="grid grid-cols-4 gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-2 py-2 border-2 text-[11px] font-mono uppercase tracking-wider ${
                lead.status === s ? "bg-ink text-paper border-ink" : "border-ink/30 hover:border-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function safeParse(s: string): Quote | null {
  try {
    return JSON.parse(s) as Quote;
  } catch {
    return null;
  }
}

function relTime(iso: string): string {
  const t = new Date(iso + "Z").getTime();
  if (Number.isNaN(t)) return iso;
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
