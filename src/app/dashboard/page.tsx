import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { ensureInit } from "@/lib/db";

function startOfTodayMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default async function Overview() {
  const op = await requireOperator();
  const store = await ensureInit();
  const leads = await store.listLeads(op.id, 500);

  const totalRevenue = leads.reduce((s, l) => s + Number(l.quote_total), 0);
  const today = leads.filter(
    (l) => new Date(l.created_at.replace(" ", "T") + "Z").getTime() >= startOfTodayMs()
  );

  const tiles = [
    { label: "Total leads", value: leads.length.toString(), note: "All time" },
    { label: "Today", value: today.length.toString(), note: "Captured today" },
    {
      label: "Pipeline value",
      value: `$${Math.round(totalRevenue).toLocaleString()}`,
      note: "Sum of quoted totals",
    },
    {
      label: "New (uncontacted)",
      value: leads.filter((l) => l.status === "new").length.toString(),
      note: "Need follow-up",
    },
  ];

  const greetName = op.business_name.split(/\s+/)[0];

  return (
    <div className="space-y-8">
      <div>
        <div className="stamp text-ink/60">Overview</div>
        <h1 className="font-display tracking-tightest mt-1 text-5xl font-semibold leading-tight">
          {leads.length === 0 ? `Welcome, ${greetName}.` : `Welcome back, ${greetName}.`}
        </h1>
        <p className="text-ink2 mt-2">
          Your widget is live at{" "}
          <Link className="underline" href={`/widget/${op.slug}`}>
            /widget/{op.slug}
          </Link>
          .{" "}
          {leads.length === 0
            ? "Paste your embed code on your site and the first leads will land here."
            : "Edit pricing or grab the embed snippet anytime."}
        </p>
      </div>

      {leads.length === 0 && (
        <div className="flex items-start gap-4 border-2 border-ink bg-white p-5 shadow-[6px_6px_0_#FF5A1F]">
          <div className="border-2 border-ink bg-safety p-2 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-display text-xl font-semibold">Get your first lead in 2 minutes</div>
            <p className="text-ink2 mt-1 text-sm">
              Copy the snippet from the{" "}
              <Link href="/dashboard/embed" className="underline decoration-safety underline-offset-4">
                Embed code
              </Link>{" "}
              page and paste it where you want the quote widget to appear.
            </p>
          </div>
          <Link href="/dashboard/embed" className="btn-safety text-sm">
            Get embed →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="border-2 border-ink bg-[#FFFCF6] p-5">
            <div className="stamp text-ink/60">{t.label}</div>
            <div className="font-display tracking-tightest tnum mt-1 text-4xl font-semibold">
              {t.value}
            </div>
            <div className="text-sub mt-2 text-xs">{t.note}</div>
          </div>
        ))}
      </div>

      <div className="border-2 border-ink bg-paperdark/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="stamp text-ink/60">Recent leads</div>
            <div className="font-display mt-1 text-2xl font-semibold">Latest 5 quotes</div>
          </div>
          <Link
            href="/dashboard/leads"
            className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"
          >
            All leads <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4">
          {leads.length === 0 ? (
            <div className="text-sub text-sm">
              No leads yet — try your widget at{" "}
              <Link className="underline" href={`/widget/${op.slug}`} target="_blank">
                /widget/{op.slug}
              </Link>{" "}
              to submit a test quote.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-sub text-left font-mono text-[11px] uppercase tracking-[0.15em]">
                  <th className="py-2">When</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Size</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map((l) => (
                  <tr key={l.id} className="border-t border-ink/20">
                    <td className="text-sub py-2 font-mono text-[12px]">{l.created_at}</td>
                    <td className="font-semibold">{l.name}</td>
                    <td className="font-mono text-[13px]">{l.phone}</td>
                    <td>{l.size_id}</td>
                    <td className="tnum text-right font-mono">
                      ${Number(l.quote_total).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
