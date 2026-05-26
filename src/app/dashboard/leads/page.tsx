import { db, listLeads } from "@/lib/db";
import { defaultRules } from "@/lib/seed-defaults";
import { LeadsTable } from "@/components/LeadsTable";

export default function LeadsPage() {
  db();
  const leads = listLeads(defaultRules.operator_slug, 500);
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs tracking-[0.2em] uppercase text-sub">Leads</div>
        <h1 className="font-display text-5xl font-semibold tracking-tightest leading-tight mt-1">
          Real customers, ready to book.
        </h1>
        <p className="text-ink2 mt-2 max-w-[60ch]">
          Every quote submitted through the widget shows up here with the full price breakdown.
          Mark them as contacted, booked, or lost.
        </p>
      </div>
      <LeadsTable initial={leads} operatorSlug={defaultRules.operator_slug} />
    </div>
  );
}
