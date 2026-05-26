"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function EmbedSnippet({ slug }: { slug: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const safeOrigin = origin || "https://your-domain.com";
  const snippet = `<script src="${safeOrigin}/embed.js" data-binquote="${slug}" defer></script>`;
  const iframeFallback = `<iframe src="${safeOrigin}/widget/${slug}" style="border:0;width:100%;height:780px" loading="lazy"></iframe>`;

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-ink bg-ink text-paper shadow-hardlg">
        <div className="flex items-center justify-between border-b-2 border-paper/20 px-4 py-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">
            recommended · 1 line
          </div>
          <button
            onClick={() => copy(snippet, "script")}
            className="btn-safety inline-flex items-center gap-1 px-3 py-1 text-[11px]"
          >
            {copied === "script" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === "script" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="text-mint whitespace-pre-wrap break-all p-5 font-mono text-sm leading-relaxed">
{snippet}
        </pre>
      </div>

      <div>
        <div className="stamp text-ink/60 mb-2">Iframe fallback</div>
        <div className="border-2 border-ink bg-[#FFFCF6]">
          <div className="flex items-center justify-between border-b-2 border-ink px-4 py-2">
            <div className="text-sub font-mono text-[11px] uppercase tracking-[0.2em]">
              if you can&apos;t add a script tag
            </div>
            <button
              onClick={() => copy(iframeFallback, "iframe")}
              className="btn-ghost inline-flex items-center gap-1 px-3 py-1 text-[11px]"
            >
              {copied === "iframe" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === "iframe" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-all p-5 font-mono text-sm leading-relaxed">
{iframeFallback}
          </pre>
        </div>
      </div>

      <div className="border-2 border-ink bg-paperdark/30 p-5">
        <div className="stamp text-ink/60">Test the live widget</div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <code className="break-all font-mono text-sm">
            {safeOrigin}/widget/{slug}
          </code>
          <a
            href={`/widget/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs"
          >
            Open <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
