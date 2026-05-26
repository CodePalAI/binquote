import EmbedSnippet from "@/components/EmbedSnippet";
import { requireOperator } from "@/lib/auth";

export default async function EmbedPage() {
  const op = await requireOperator();
  return (
    <div className="space-y-5">
      <div>
        <div className="stamp text-ink/60">Embed code</div>
        <h1 className="font-display tracking-tightest mt-1 text-4xl font-semibold">
          Drop it anywhere.
        </h1>
        <p className="text-ink2 mt-2 max-w-xl">
          One iframe snippet. Works on WordPress, Wix, Squarespace, Webflow, or any plain HTML
          site. Quotes calculate live, leads land in your inbox.
        </p>
      </div>
      <EmbedSnippet slug={op.slug} />
    </div>
  );
}
