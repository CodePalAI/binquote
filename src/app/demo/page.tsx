import Script from "next/script";
import { headers } from "next/headers";
import Link from "next/link";
import { defaultRules } from "@/lib/seed-defaults";
import { Phone, Truck, MapPin, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DemoOperatorSite() {
  const h = await headers();
  const host = h.get("host") || "localhost:3030";
  const proto = host.includes("localhost") ? "http" : "https";
  const origin = `${proto}://${host}`;

  return (
    <div className="bg-[#0F1216] text-[#E8E2D2] min-h-screen">
      {/* Floating ribbon so visitors know this is the embed demo */}
      <div className="fixed bottom-4 right-4 z-50 border-2 border-[#FF5A1F] bg-[#0F1216] text-[#FF5A1F] px-3 py-2 font-mono text-[11px] tracking-[0.15em] uppercase shadow-[4px_4px_0_0_#FF5A1F]">
        ⚡ This is a fake operator site
        <div className="text-[#E8E2D2]/70 normal-case text-[10px] mt-0.5">
          The widget below is loaded via <code className="text-[#FF5A1F]">embed.js</code>
        </div>
        <Link
          href="/"
          className="block mt-1 text-[#E8E2D2] underline normal-case text-[10px]"
        >
          ← Back to BinQuote
        </Link>
      </div>

      {/* Operator's "real" website — heavy industrial dark theme so it clearly is NOT BinQuote */}
      <header className="border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 grid place-items-center bg-[#FF5A1F] text-black font-black text-lg">
              I
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-tight">IRONSIDE HAULING CO.</div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-[#E8E2D2]/60">
                Family-owned · Raleigh, NC · Since 2014
              </div>
            </div>
          </div>
          <a
            href={`tel:${defaultRules.phone.replace(/[^0-9+]/g, "")}`}
            className="hidden sm:inline-flex items-center gap-2 border-2 border-[#FF5A1F] px-4 py-2 text-sm font-bold"
          >
            <Phone className="w-4 h-4" /> {defaultRules.phone}
          </a>
        </div>
      </header>

      <section
        className="relative border-b border-white/10"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #0F1216 0%, #1A1410 60%, #2A1A0E 100%)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#FF5A1F]/40 px-3 py-1 text-[11px] tracking-[0.2em] uppercase text-[#FF5A1F]">
              Roll-off dumpsters · 10-40 yard
            </div>
            <h1 className="mt-5 font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight">
              We haul.
              <br />
              You build.
              <br />
              <span className="text-[#FF5A1F]">Same day delivery.</span>
            </h1>
            <p className="mt-5 text-[#E8E2D2]/80 max-w-md text-lg">
              Three trucks, no middlemen, no hidden fees. Get a real price in 30 seconds —
              then we drop the bin wherever you need it.
            </p>
            <div className="mt-7 flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#FF5A1F]" /> Same-day if booked by 11&nbsp;a.m.</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF5A1F]" /> Wake County</div>
            </div>
            <div className="mt-7 flex items-center gap-1 text-[#FF5A1F]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-[#E8E2D2]/80 text-sm ml-2">4.9 · 312 Google reviews</span>
            </div>
          </div>
          <div>
            <div id="binquote-anchor" />
            {/* The actual BinQuote embed snippet — this is what an operator pastes */}
            <Script
              id="binquote-loader"
              strategy="afterInteractive"
              src={`${origin}/embed.js`}
              data-binquote={defaultRules.operator_slug}
            />
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#E8E2D2]/50 mt-2 font-mono">
              ↑ Powered by BinQuote · Embedded with one &lt;script&gt; tag
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-5 md:px-8 py-14 grid md:grid-cols-3 gap-6">
        {[
          { t: "Sizes for every job", b: "10, 15, 20, 30, and 40-yard roll-offs. Clean concrete? Heavy mixed load? Just pick what's in the dumpster." },
          { t: "Upfront pricing", b: "No \"call us\" runaround. Tonnage, days, debris type, ZIP — quoted instantly." },
          { t: "Owner-operated", b: "Every truck is dispatched by Mike or his brother Wes. You always know who's coming." },
        ].map((x) => (
          <div key={x.t} className="border border-white/15 p-6">
            <div className="font-display text-2xl font-semibold leading-tight">{x.t}</div>
            <p className="text-[#E8E2D2]/75 mt-2 text-sm">{x.b}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between text-xs text-[#E8E2D2]/60">
          <div>© Ironside Hauling Co. · Fictional demo company</div>
          <div className="font-mono">Quote engine: BinQuote · /embed.js · operator: {defaultRules.operator_slug}</div>
        </div>
      </footer>
    </div>
  );
}
