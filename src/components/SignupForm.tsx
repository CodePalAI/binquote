"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm({ verifiedEmail }: { verifiedEmail: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState(verifiedEmail || "");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [brandColor, setBrandColor] = useState("#FF5A1F");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!verifiedEmail) {
      // First click: send magic link.
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, intent: "signup" }),
      });
      const json = await res.json();
      setSubmitting(false);
      if (!res.ok) return setError(json.error || "Failed to send link");
      sessionStorage.setItem(
        "binquote_signup_draft",
        JSON.stringify({ businessName, phone, city, state, brandColor })
      );
      setMagicSent(true);
      if (json.dev_link) setDevLink(json.dev_link);
      return;
    }

    // Email already verified — create operator.
    const res = await fetch("/api/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        business_name: businessName,
        phone,
        city,
        state,
        brand_color: brandColor,
      }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(json.error || "Failed to create account");
    sessionStorage.removeItem("binquote_signup_draft");
    router.push("/onboarding/done");
  }

  if (magicSent) {
    return (
      <div className="border-2 border-ink bg-white p-6">
        <div className="stamp text-leaf mb-3">verify email</div>
        <h3 className="font-display text-2xl text-ink mb-2">Check your inbox</h3>
        <p className="text-ink/70">
          We sent a verification link to <strong className="text-ink">{email}</strong>. Click it to
          finish setting up <strong>{businessName}</strong>.
        </p>
        {devLink && (
          <div className="mt-4 border-t-2 border-dashed border-ink/30 pt-4">
            <div className="stamp text-safety mb-2">dev mode</div>
            <a
              href={devLink}
              className="block break-all border-2 border-ink bg-paper px-3 py-2 font-mono text-xs hover:bg-safety hover:text-white"
            >
              {devLink}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="stamp text-ink/60">business name</span>
        <input
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Ironside Hauling Co."
          className="mt-1 w-full border-2 border-ink bg-white px-4 py-3 font-medium focus:outline-none focus:bg-paper"
        />
      </label>
      <label className="block">
        <span className="stamp text-ink/60">work email</span>
        <input
          type="email"
          required
          value={email}
          readOnly={!!verifiedEmail}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          className="mt-1 w-full border-2 border-ink bg-white px-4 py-3 font-medium focus:outline-none focus:bg-paper read-only:bg-paper read-only:text-ink/60"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="stamp text-ink/60">phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(919) 555-0140"
            className="mt-1 w-full border-2 border-ink bg-white px-4 py-3 focus:outline-none focus:bg-paper"
          />
        </label>
        <label className="block">
          <span className="stamp text-ink/60">city, state</span>
          <div className="mt-1 flex gap-1">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Raleigh"
              className="w-full border-2 border-ink bg-white px-4 py-3 focus:outline-none focus:bg-paper"
            />
            <input
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="NC"
              className="w-20 border-2 border-ink bg-white px-3 py-3 text-center font-mono focus:outline-none focus:bg-paper"
            />
          </div>
        </label>
      </div>
      <label className="flex items-center gap-3 border-2 border-ink bg-white px-4 py-3">
        <span className="stamp text-ink/60">brand color</span>
        <input
          type="color"
          value={brandColor}
          onChange={(e) => setBrandColor(e.target.value)}
          className="h-8 w-12 cursor-pointer border-2 border-ink"
        />
        <span className="font-mono text-sm text-ink/70">{brandColor}</span>
      </label>
      <button type="submit" disabled={submitting} className="btn-safety w-full">
        {submitting ? "..." : verifiedEmail ? "Create account →" : "Verify email & continue →"}
      </button>
      {error && <p className="text-sm text-safety">{error}</p>}
      <p className="text-xs text-ink/50">
        14-day free trial. No credit card. Cancel anytime.
      </p>
    </form>
  );
}
