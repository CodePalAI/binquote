import PricingEditor from "@/components/PricingEditor";
import { requireOperator } from "@/lib/auth";

export default async function PricingPage() {
  const op = await requireOperator();
  return (
    <div className="space-y-5">
      <div>
        <div className="stamp text-ink/60">Pricing rules</div>
        <h1 className="font-display tracking-tightest mt-1 text-4xl font-semibold">
          Set what you charge.
        </h1>
        <p className="text-ink2 mt-2 max-w-xl">
          Edit sizes, debris surcharges, and zones. The preview on the right updates instantly —
          this is the same widget your customers will use.
        </p>
      </div>
      <PricingEditor initialRules={op.rules} />
    </div>
  );
}
