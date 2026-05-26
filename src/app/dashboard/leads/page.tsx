import LeadsTable from "@/components/LeadsTable";
import { requireOperator } from "@/lib/auth";
import { ensureInit } from "@/lib/db";

export default async function LeadsPage() {
  const op = await requireOperator();
  const store = await ensureInit();
  const leads = await store.listLeads(op.id, 500);
  return (
    <div className="space-y-5">
      <div>
        <div className="stamp text-ink/60">Leads</div>
        <h1 className="font-display tracking-tightest mt-1 text-4xl font-semibold">
          Your inbox.
        </h1>
        <p className="text-ink2 mt-2">
          Every quote your widget captures lands here. Tap a row, see the full breakdown, call them
          back fast.
        </p>
      </div>
      <LeadsTable initialLeads={leads} />
    </div>
  );
}
