import Link from "next/link";
import { redirect } from "next/navigation";
import { currentOperator } from "@/lib/auth";
import EmbedSnippet from "@/components/EmbedSnippet";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OnboardingDone() {
  const op = await currentOperator();
  if (!op) redirect("/login");

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-20">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-leaf h-8 w-8" />
          <div className="stamp text-leaf border-leaf">Account ready</div>
        </div>
        <h1 className="font-display tracking-tightest mt-4 text-5xl font-semibold leading-tight">
          You&apos;re live, {op.business_name}.
        </h1>
        <p className="text-ink2 mt-3 max-w-2xl text-lg">
          Your widget is loaded with sensible starter pricing. Paste the snippet below on your
          site, then{" "}
          <Link href="/dashboard/pricing" className="underline decoration-safety underline-offset-4">
            fine-tune your pricing
          </Link>{" "}
          anytime.
        </p>

        <div className="mt-8">
          <EmbedSnippet slug={op.slug} />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="btn-safety inline-flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-wide"
          >
            Open your dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/pricing"
            className="btn-ghost inline-flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-wide"
          >
            Tune pricing
          </Link>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Paste the snippet",
              b: "Drop it into your website where you want quotes captured.",
            },
            {
              n: "02",
              t: "Confirm your pricing",
              b: "Open the pricing editor and check sizes, zones, and surcharges match your rate card.",
            },
            {
              n: "03",
              t: "Watch leads land",
              b: "We&apos;ll email you the moment a quote is submitted. Manage status in Leads.",
            },
          ].map((s) => (
            <li key={s.n} className="border-2 border-ink bg-[#FFFCF6] p-4">
              <div className="text-safetydk font-mono text-[11px] tracking-[0.2em]">{s.n}</div>
              <div className="font-display mt-1 text-lg font-semibold">{s.t}</div>
              <p className="text-ink2 mt-1 text-sm" dangerouslySetInnerHTML={{ __html: s.b }} />
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
