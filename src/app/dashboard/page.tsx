import Link from "next/link";
import { db, listLeads } from "@/lib/db";
import { defaultRules } from "@/lib/seed-defaults";
import { ArrowUpRight } from "lucide-react";

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function Overview() {
  db();
  const leads = listLeads(defaultRules.operator_slug, 500);
  const totalRevenue = leads.reduce((s, l) => s + l.quote_total, 0);
  const today = leads.filter(
    (l) => new Date(l.created_at + "Z").getTime() >= new Date(startOfTodayIso()).getTime()
  );

  const tiles = [
    { label: "Total leads", value: leads.length.toString(), note: "All time" },
    { label: "Today", value: today.length.toString(), note: "Captured today" },
    { label: "Pipeline value", value: `$${Math.round(totalRevenue).toLocaleString()}`, note: "Sum of quoted totals" },
    { label: "New (uncontacted)", value: leads.filter((l) => l.status === "new").length.toString(), note: "Need follow-up" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-xs tracking-[0.2em] uppercase text-sub">Overview</div>
        <h1 className="font-display text-5xl font-semibold tracking-tightest leading-tight mt-1">
          Good morning, Ironside.
        </h1>
        <p className="text-ink2 mt-2">
          Your widget is live at{" "}
          <Link className="underline" href={`/widget/${defaultRules.operator_slug}`}>
            /widget/{defaultRules.operator_slug}
          </Link>
          . Edit pricing or see the embed snippet to ship it.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="border-2 border-ink bg-[#FFFCF6] p-5">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-sub">{t.label}</div>
            <div className="font-display text-4xl font-semibold tnum mt-1 tracking-tightest">{t.value}</div>
            <div className="text-xs text-sub mt-2">{t.note}</div>
          </div>
        ))}
      </div>

      <div className="border-2 border-ink bg-paperdark/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-sub">Recent leads</div>
            <div className="font-display text-2xl font-semibold mt-1">Latest 5 quotes</div>
          </div>
          <Link href="/dashboard/leads" className="btn-ghost px-3 py-1.5 text-xs inline-flex items-center gap-1">
            All leads <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="mt-4">
          {leads.length === 0 ? (
            <div className="text-sub text-sm">
              No leads yet. Open the{" "}
              <Link href="/" className="underline">marketing page</Link> and submit a test quote to see one here.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sub font-mono text-[11px] tracking-[0.15em] uppercase">
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
                    <td className="py-2 font-mono text-[12px] text-sub">{l.created_at}</td>
                    <td className="font-semibold">{l.name}</td>
                    <td className="font-mono text-[13px]">{l.phone}</td>
                    <td>{l.size_id}</td>
                    <td className="text-right tnum font-mono">${l.quote_total.toFixed(0)}</td>
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
