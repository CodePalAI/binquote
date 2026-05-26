"use client";

import { useEffect, useMemo, useState } from "react";
import type { PricingRules } from "@/lib/types";
import { QuoteWidget } from "@/components/QuoteWidget";
import { Save, RotateCw, CheckCircle2, AlertTriangle } from "lucide-react";

export function PricingEditor({ initialRules }: { initialRules: PricingRules }) {
  const [text, setText] = useState(() => JSON.stringify(initialRules, null, 2));
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  const parsed = useMemo(() => {
    try {
      const obj = JSON.parse(text);
      if (!obj?.operator_slug || !Array.isArray(obj.sizes)) {
        return { ok: false as const, err: "Missing operator_slug or sizes[]" };
      }
      return { ok: true as const, rules: obj as PricingRules };
    } catch (e) {
      return { ok: false as const, err: (e as Error).message };
    }
  }, [text]);

  useEffect(() => {
    setSaved("idle");
  }, [text]);

  async function save() {
    if (!parsed.ok) return;
    setSaved("saving");
    setErr(null);
    try {
      const r = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.rules),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || "Save failed");
      }
      setSaved("ok");
    } catch (e) {
      setErr((e as Error).message);
      setSaved("err");
    }
  }

  function reset() {
    setText(JSON.stringify(initialRules, null, 2));
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
      <div className="border-2 border-ink bg-ink text-paper shadow-hardlg">
        <div className="flex items-center justify-between border-b-2 border-paper/20 px-4 py-2">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase opacity-70">
            rules.json
          </div>
          <div className="flex items-center gap-2">
            {parsed.ok ? (
              <span className="chip border-mint text-mint bg-transparent">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
              </span>
            ) : (
              <span className="chip border-safety text-safety bg-transparent">
                <AlertTriangle className="w-3.5 h-3.5" /> {parsed.err.slice(0, 60)}
              </span>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="w-full h-[640px] bg-ink text-mint font-mono text-[12.5px] leading-relaxed p-4 outline-none resize-none"
        />
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t-2 border-paper/20">
          <div className="text-xs opacity-70">
            {saved === "ok" && "Saved. The widget below now uses these rules."}
            {saved === "err" && <span className="text-safety">Error: {err}</span>}
            {saved === "saving" && "Saving…"}
            {saved === "idle" && "Edit any field — preview updates live."}
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="btn-ghost border-paper text-paper px-3 py-1.5 text-xs inline-flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={save}
              disabled={!parsed.ok || saved === "saving"}
              className="btn-safety px-3 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-6">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sub mb-2">
          Live preview
        </div>
        {parsed.ok ? (
          <QuoteWidget rules={parsed.rules} compact />
        ) : (
          <div className="border-2 border-ink bg-paperdark/40 p-6 text-sm">
            JSON has an error — fix it on the left and the widget will reappear.
          </div>
        )}
      </div>
    </div>
  );
}
