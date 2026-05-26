"use client";

import { useState } from "react";

export default function MagicLinkForm({
  defaultEmail = "",
  defaultIntent = "login",
  cta = "Send sign-in link",
}: {
  defaultEmail?: string;
  defaultIntent?: "login" | "signup";
  cta?: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setMessage("");
    setDevLink(null);
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, intent: defaultIntent }),
    });
    const json = await res.json();
    if (!res.ok) {
      setState("error");
      setMessage(json.error || "Something went wrong");
      return;
    }
    setState("sent");
    if (json.dev_link) setDevLink(json.dev_link);
  }

  if (state === "sent") {
    return (
      <div className="border-2 border-ink bg-white p-6">
        <div className="stamp text-leaf mb-3">link sent</div>
        <h3 className="font-display text-2xl text-ink mb-2">Check your inbox</h3>
        <p className="text-ink/70">
          We sent a sign-in link to <strong className="text-ink">{email}</strong>. It expires in
          20 minutes.
        </p>
        {devLink && (
          <div className="mt-4 border-t-2 border-dashed border-ink/30 pt-4">
            <div className="stamp text-safety mb-2">dev mode</div>
            <p className="text-sm text-ink/70 mb-2">
              No <code className="chip">RESEND_API_KEY</code> configured — click here to sign in:
            </p>
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
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="stamp text-ink/60">work email</span>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourcompany.com"
          className="mt-1 w-full border-2 border-ink bg-white px-4 py-3 font-medium focus:outline-none focus:ring-0 focus:bg-paper"
        />
      </label>
      <button type="submit" disabled={state === "loading"} className="btn-safety w-full">
        {state === "loading" ? "Sending..." : cta}
      </button>
      {state === "error" && <p className="text-sm text-safety">{message}</p>}
    </form>
  );
}
