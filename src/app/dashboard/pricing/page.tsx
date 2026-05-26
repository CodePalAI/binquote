import { getOperator } from "@/lib/db";
import { defaultRules } from "@/lib/seed-defaults";
import { PricingEditor } from "@/components/PricingEditor";

export default function PricingPage() {
  const rules = getOperator(defaultRules.operator_slug) ?? defaultRules;
  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs tracking-[0.2em] uppercase text-sub">Pricing rules</div>
        <h1 className="font-display text-5xl font-semibold tracking-tightest leading-tight mt-1">
          Your rate card, in one place.
        </h1>
        <p className="text-ink2 mt-2 max-w-[60ch]">
          Edit the JSON on the left — the live widget on the right recalculates instantly.
          Click <span className="font-semibold">Save</span> to push to the database. This is the
          same engine that powers every quote on your site.
        </p>
      </div>
      <PricingEditor initialRules={rules} />
    </div>
  );
}
