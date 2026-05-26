"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function EmbedSnippet({ origin, slug }: { origin: string; slug: string }) {
  const snippet = `<script src="${origin}/embed.js" data-binquote="${slug}" defer></script>`;
  const [copied, setCopied] = useState(false);
  return (
    <div className="border-2 border-ink bg-ink text-paper shadow-hardlg">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-paper/20">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase opacity-70">snippet.html</div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="btn-safety px-3 py-1 text-[11px] inline-flex items-center gap-1"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-5 text-mint text-sm whitespace-pre-wrap break-all font-mono leading-relaxed">
{snippet}
      </pre>
    </div>
  );
}
