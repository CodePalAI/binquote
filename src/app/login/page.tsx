import Link from "next/link";
import MagicLinkForm from "@/components/MagicLinkForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen bg-paper paper-grain text-ink">
      <div className="mx-auto max-w-md px-6 py-16">
        <Link href="/" className="stamp text-ink/60 hover:text-safety">
          ← BinQuote
        </Link>
        <h1 className="mt-6 font-display text-5xl leading-[0.9] text-ink">Sign in.</h1>
        <p className="mt-3 text-ink/70">
          We&apos;ll email you a one-tap link. No password to remember.
        </p>
        {error === "expired" && (
          <div className="mt-4 border-l-4 border-safety bg-white p-3 text-sm text-ink">
            That link expired or was already used. Request a fresh one.
          </div>
        )}
        <div className="mt-6">
          <MagicLinkForm defaultIntent="login" cta="Send sign-in link" />
        </div>
        <p className="mt-6 text-sm text-ink/60">
          New to BinQuote?{" "}
          <Link href="/signup" className="text-ink underline decoration-safety underline-offset-4">
            Start your trial
          </Link>
        </p>
      </div>
    </main>
  );
}
