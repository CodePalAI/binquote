"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Save, Check } from "lucide-react";
import type {
  PricingRules,
  DumpsterSize,
  DebrisModifier,
  ServiceZone,
  DebrisType,
} from "@/lib/types";
import { QuoteWidget } from "./QuoteWidget";

const DEBRIS_TYPES: DebrisType[] = [
  "household",
  "construction",
  "concrete",
  "roofing",
  "yard",
  "mixed_heavy",
];

export default function PricingEditor({
  initialRules,
  saveLabel = "Save changes",
  onAfterSave,
}: {
  initialRules: PricingRules;
  saveLabel?: string;
  onAfterSave?: () => void;
}) {
  const [rules, setRules] = useState<PricingRules>(initialRules);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const lastSaved = useRef(JSON.stringify(initialRules));

  const dirty = useMemo(
    () => JSON.stringify(rules) !== lastSaved.current,
    [rules]
  );

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  async function save() {
    setSaveState("saving");
    setError(null);
    const res = await fetch("/api/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rules),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed to save");
      setSaveState("error");
      return;
    }
    lastSaved.current = JSON.stringify(rules);
    setSaveState("saved");
    onAfterSave?.();
    setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
  }

  function updateSize(idx: number, patch: Partial<DumpsterSize>) {
    setRules((r) => ({
      ...r,
      sizes: r.sizes.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  }
  function addSize() {
    setRules((r) => ({
      ...r,
      sizes: [
        ...r.sizes,
        {
          id: `size-${Date.now()}`,
          label: "New size",
          base_price: 400,
          tons_included: 2,
          rental_days: 7,
          day_overage: 15,
        },
      ],
    }));
  }
  function removeSize(idx: number) {
    setRules((r) => ({ ...r, sizes: r.sizes.filter((_, i) => i !== idx) }));
  }

  function updateDebris(idx: number, patch: Partial<DebrisModifier>) {
    setRules((r) => ({
      ...r,
      debris: r.debris.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    }));
  }
  function addDebris() {
    const unused = DEBRIS_TYPES.find(
      (t) => !rules.debris.some((d) => d.type === t)
    );
    if (!unused) return;
    setRules((r) => ({
      ...r,
      debris: [
        ...r.debris,
        { type: unused, label: unused, base_adjust: 0, tons_adjust: 0 },
      ],
    }));
  }
  function removeDebris(idx: number) {
    setRules((r) => ({ ...r, debris: r.debris.filter((_, i) => i !== idx) }));
  }

  function updateZone(idx: number, patch: Partial<ServiceZone>) {
    setRules((r) => ({
      ...r,
      zones: r.zones.map((z, i) => (i === idx ? { ...z, ...patch } : z)),
    }));
  }
  function addZone() {
    setRules((r) => ({
      ...r,
      zones: [
        ...r.zones,
        {
          id: `zone-${Date.now()}`,
          label: "New zone",
          zips: [],
          delivery_fee: 50,
        },
      ],
    }));
  }
  function removeZone(idx: number) {
    setRules((r) => ({ ...r, zones: r.zones.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <Section title="Brand" subtitle="Shown at the top of every quote.">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="stamp text-ink/60">business name</span>
              <input
                className="mt-1 w-full border-2 border-ink bg-white px-3 py-2"
                value={rules.business_name}
                onChange={(e) =>
                  setRules((r) => ({ ...r, business_name: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="stamp text-ink/60">phone shown to customer</span>
              <input
                className="mt-1 w-full border-2 border-ink bg-white px-3 py-2"
                value={rules.phone}
                onChange={(e) => setRules((r) => ({ ...r, phone: e.target.value }))}
              />
            </label>
            <label className="col-span-2 flex items-center gap-3 border-2 border-ink bg-white px-4 py-3">
              <span className="stamp text-ink/60">brand color</span>
              <input
                type="color"
                value={rules.brand_color}
                onChange={(e) =>
                  setRules((r) => ({ ...r, brand_color: e.target.value }))
                }
                className="h-8 w-12 cursor-pointer border-2 border-ink"
              />
              <span className="font-mono text-sm text-ink/70">
                {rules.brand_color}
              </span>
            </label>
          </div>
        </Section>

        <Section title="Dumpster sizes" subtitle="What you rent and what the base price covers.">
          <div className="space-y-3">
            <div className="grid grid-cols-[1.3fr_0.8fr_0.7fr_0.7fr_0.7fr_auto] gap-2 px-1 text-[10px] uppercase tracking-[0.18em] text-ink/50">
              <span>Label</span>
              <span>Base $</span>
              <span>Tons inc.</span>
              <span>Days inc.</span>
              <span>$/extra day</span>
              <span></span>
            </div>
            {rules.sizes.map((s, i) => (
              <div
                key={s.id}
                className="grid grid-cols-[1.3fr_0.8fr_0.7fr_0.7fr_0.7fr_auto] gap-2"
              >
                <input
                  className="border-2 border-ink bg-white px-3 py-2"
                  value={s.label}
                  onChange={(e) => updateSize(i, { label: e.target.value })}
                />
                <NumberInput
                  value={s.base_price}
                  onChange={(v) => updateSize(i, { base_price: v })}
                  prefix="$"
                />
                <NumberInput
                  value={s.tons_included}
                  step={0.5}
                  onChange={(v) => updateSize(i, { tons_included: v })}
                />
                <NumberInput
                  value={s.rental_days}
                  onChange={(v) => updateSize(i, { rental_days: v })}
                />
                <NumberInput
                  value={s.day_overage}
                  onChange={(v) => updateSize(i, { day_overage: v })}
                  prefix="$"
                />
                <button
                  type="button"
                  onClick={() => removeSize(i)}
                  className="border-2 border-ink p-2 hover:bg-safety hover:text-white"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSize}
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> Add size
            </button>
          </div>
        </Section>

        <Section
          title="Debris types & surcharges"
          subtitle="Charge more for heavy stuff. Negative = discount."
        >
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_1.2fr_0.7fr_0.7fr_auto] gap-2 px-1 text-[10px] uppercase tracking-[0.18em] text-ink/50">
              <span>Type</span>
              <span>Label shown to customer</span>
              <span>Base $ adj.</span>
              <span>Tons adj.</span>
              <span></span>
            </div>
            {rules.debris.map((d, i) => (
              <div
                key={`${d.type}-${i}`}
                className="grid grid-cols-[1fr_1.2fr_0.7fr_0.7fr_auto] gap-2"
              >
                <select
                  className="border-2 border-ink bg-white px-3 py-2 font-mono text-sm"
                  value={d.type}
                  onChange={(e) =>
                    updateDebris(i, { type: e.target.value as DebrisType })
                  }
                >
                  {DEBRIS_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  className="border-2 border-ink bg-white px-3 py-2"
                  value={d.label}
                  onChange={(e) => updateDebris(i, { label: e.target.value })}
                />
                <NumberInput
                  value={d.base_adjust}
                  onChange={(v) => updateDebris(i, { base_adjust: v })}
                  prefix="$"
                  allowNegative
                />
                <NumberInput
                  value={d.tons_adjust}
                  step={0.25}
                  onChange={(v) => updateDebris(i, { tons_adjust: v })}
                  allowNegative
                />
                <button
                  type="button"
                  onClick={() => removeDebris(i)}
                  className="border-2 border-ink p-2 hover:bg-safety hover:text-white"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addDebris}
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> Add debris type
            </button>
          </div>
        </Section>

        <Section
          title="Service zones & delivery fees"
          subtitle="Comma-separated ZIPs. Anything outside falls back to the default zone."
        >
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_2fr_0.7fr_0.7fr_auto] gap-2 px-1 text-[10px] uppercase tracking-[0.18em] text-ink/50">
              <span>Zone label</span>
              <span>ZIPs (comma-separated)</span>
              <span>Delivery $</span>
              <span>Default?</span>
              <span></span>
            </div>
            {rules.zones.map((z, i) => (
              <div
                key={z.id}
                className="grid grid-cols-[1fr_2fr_0.7fr_0.7fr_auto] gap-2"
              >
                <input
                  className="border-2 border-ink bg-white px-3 py-2"
                  value={z.label}
                  onChange={(e) => updateZone(i, { label: e.target.value })}
                />
                <input
                  className="border-2 border-ink bg-white px-3 py-2 font-mono text-sm"
                  value={z.zips.join(", ")}
                  onChange={(e) =>
                    updateZone(i, {
                      zips: e.target.value
                        .split(/[,\s]+/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="27601, 27603..."
                />
                <NumberInput
                  value={z.delivery_fee}
                  onChange={(v) => updateZone(i, { delivery_fee: v })}
                  prefix="$"
                />
                <label className="flex items-center justify-center border-2 border-ink bg-white">
                  <input
                    type="radio"
                    name="default_zone"
                    checked={rules.default_zone_id === z.id}
                    onChange={() =>
                      setRules((r) => ({ ...r, default_zone_id: z.id }))
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeZone(i)}
                  className="border-2 border-ink p-2 hover:bg-safety hover:text-white"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addZone}
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> Add zone
            </button>
          </div>
        </Section>

        <Section title="Settings" subtitle="Tax and policy text shown on the quote.">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="stamp text-ink/60">overage / extra ton</span>
              <NumberInput
                value={rules.overage_per_ton}
                onChange={(v) =>
                  setRules((r) => ({ ...r, overage_per_ton: v }))
                }
                prefix="$"
              />
            </label>
            <label className="block">
              <span className="stamp text-ink/60">tax rate (%)</span>
              <NumberInput
                value={rules.tax_rate_pct}
                step={0.25}
                onChange={(v) => setRules((r) => ({ ...r, tax_rate_pct: v }))}
              />
            </label>
            <label className="col-span-2 block">
              <span className="stamp text-ink/60">estimate disclaimer</span>
              <textarea
                className="mt-1 w-full border-2 border-ink bg-white px-3 py-2 text-sm"
                rows={2}
                value={rules.estimate_disclaimer}
                onChange={(e) =>
                  setRules((r) => ({ ...r, estimate_disclaimer: e.target.value }))
                }
              />
            </label>
            <label className="col-span-2 block">
              <span className="stamp text-ink/60">permit note</span>
              <textarea
                className="mt-1 w-full border-2 border-ink bg-white px-3 py-2 text-sm"
                rows={2}
                value={rules.permit_note}
                onChange={(e) =>
                  setRules((r) => ({ ...r, permit_note: e.target.value }))
                }
              />
            </label>
          </div>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-2 border-t-2 border-ink bg-paper/95 px-2 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <span className="stamp text-ink/60">
              {dirty ? "unsaved changes" : "in sync"}
            </span>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saveState === "saving"}
              className="btn-safety inline-flex items-center gap-2 disabled:opacity-40"
            >
              {saveState === "saved" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveState === "saved" ? "Saved" : saveLabel}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-safety">{error}</p>}
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="stamp mb-2 text-ink/60">
          live preview · what your visitors see
        </div>
        <div className="border-2 border-ink bg-white shadow-[6px_6px_0_#16110D]">
          <PreviewWidget rules={rules} />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-2 border-ink bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b-2 border-dashed border-ink/30 pb-3">
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function NumberInput({
  value,
  onChange,
  step = 1,
  prefix,
  allowNegative = false,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  prefix?: string;
  allowNegative?: boolean;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-sm text-ink/50">
          {prefix}
        </span>
      )}
      <input
        type="number"
        step={step}
        min={allowNegative ? undefined : 0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full border-2 border-ink bg-white px-3 py-2 text-right font-mono text-sm tabular-nums ${
          prefix ? "pl-7" : ""
        }`}
      />
    </div>
  );
}

function PreviewWidget({ rules }: { rules: PricingRules }) {
  const key = useMemo(
    () =>
      JSON.stringify({
        s: rules.sizes.length,
        d: rules.debris.length,
        z: rules.zones.length,
      }),
    [rules]
  );
  return <QuoteWidget key={key} rulesOverride={rules} />;
}
