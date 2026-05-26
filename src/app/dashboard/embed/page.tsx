import { headers } from "next/headers";
import { defaultRules } from "@/lib/seed-defaults";
import { EmbedSnippet } from "@/components/EmbedSnippet";

export default async function EmbedPage() {
  const h = await headers();
  const host = h.get("host") || "localhost:3030";
  const proto = host.includes("localhost") ? "http" : "https";
  const origin = `${proto}://${host}`;

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs tracking-[0.2em] uppercase text-sub">Embed code</div>
        <h1 className="font-display text-5xl font-semibold tracking-tightest leading-tight mt-1">
          Ship it in one line.
        </h1>
        <p className="text-ink2 mt-2 max-w-[60ch]">
          Paste this snippet anywhere on your website — Wix, Squarespace, WordPress, Webflow,
          Shopify, or hand-coded HTML. The widget loads in a sandboxed iframe and auto-resizes.
        </p>
      </div>

      <EmbedSnippet origin={origin} slug={defaultRules.operator_slug} />

      <div className="border-2 border-ink bg-paperdark/30 p-5">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sub">Direct link</div>
        <div className="mt-1">
          You can also link customers straight to{" "}
          <a
            className="underline font-semibold"
            href={`/widget/${defaultRules.operator_slug}`}
          >
            /widget/{defaultRules.operator_slug}
          </a>{" "}
          — useful for Instagram bios, Google Business Profile, or email signatures.
        </div>
      </div>
    </div>
  );
}
