import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; verified?: string }>;
}) {
  const { email, verified } = await searchParams;
  const verifiedEmail = verified === "1" && email ? email : null;

  return (
    <main className="min-h-screen bg-paper paper-grain text-ink">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr]">
        <div>
          <Link href="/" className="stamp text-ink/60 hover:text-safety">
            ← BinQuote
          </Link>
          <h1 className="mt-6 font-display text-5xl leading-[0.9] text-ink md:text-6xl">
            Start quoting in
            <br />
            <span className="text-safety">10 minutes.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink/70">
            Set your sizes, drop our snippet on your site, and start collecting real quotes
            tonight. No credit card.
          </p>

          <ul className="mt-8 space-y-3 text-ink">
            {[
              "Visual pricing editor — no spreadsheets, no JSON",
              "Instant lead notifications to your inbox",
              "One copy-paste snippet, lives on any site",
              "14 days free. Pro is $79/mo if you keep it.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-3 w-3 -rotate-45 border-2 border-ink bg-safety" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-2 border-ink bg-white p-6 shadow-[6px_6px_0_#16110D]">
          <div className="stamp text-ink/60 mb-2">
            {verifiedEmail ? "step 2 of 2 — your business" : "step 1 of 2 — about you"}
          </div>
          <h2 className="mb-5 font-display text-3xl text-ink">
            {verifiedEmail ? "Tell us about your hauling company" : "Create your operator account"}
          </h2>
          <SignupForm verifiedEmail={verifiedEmail} />
          <p className="mt-4 text-sm text-ink/60">
            Already have an account?{" "}
            <Link href="/login" className="text-ink underline decoration-safety underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
