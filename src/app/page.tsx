import Link from "next/link";
import { ArrowRight, BadgeCheck, Bolt, Phone, Truck, Wrench, Code2 } from "lucide-react";
import { ensureInit } from "@/lib/db";
import { QuoteWidget } from "@/components/QuoteWidget";
import { defaultRules } from "@/lib/seed-defaults";
import { ensureDemoOperator, DEMO_SLUG } from "@/lib/demo-seed";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  await ensureDemoOperator();
  const store = await ensureInit();
  const rules = (await store.getOperatorBySlug(DEMO_SLUG))?.rules ?? defaultRules;

  return (
    <main className="min-h-screen bg-paper text-ink overflow-x-clip">
      {/* NAV */}
      <header className="border-b-2 border-ink">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-ink bg-safety grid place-items-center font-display font-bold leading-none">
              B
            </div>
            <div className="font-display text-xl tracking-tightest font-semibold">
              BinQuote
            </div>
            <span className="chip ml-2 hidden sm:inline-flex">For roll-off operators</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#how" className="hover:text-safetydk">How it works</a>
            <a href="#pricing" className="hover:text-safetydk">Pricing</a>
            <a href="#integrate" className="hover:text-safetydk">Integrate</a>
            <Link href="/login" className="hover:text-safetydk">Sign in</Link>
          </nav>
          <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
            Start free trial
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative paper-grain">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-12 grid lg:grid-cols-[1.05fr_1fr] gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="stamp">Roll-off operators</span>
              <span className="chip">No CRM migration</span>
            </div>
            <h1 className="font-display tracking-tightest leading-[0.92] font-semibold text-[clamp(46px,8vw,96px)]">
              Stop losing
              <br />
              jobs to
              <span className="relative inline-block ml-2">
                <span className="relative z-10">“call for price.”</span>
                <span className="absolute left-0 right-0 bottom-2 h-3 bg-safety z-0" aria-hidden />
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink2 max-w-[58ch] leading-snug">
              BinQuote is a drop-in <span className="font-semibold">instant quote widget</span> for
              independent dumpster haulers. Paste one line into your website and start
              capturing booked leads at 2&nbsp;a.m. while your competitors are still
              answering voicemail.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn-safety px-5 py-3 text-sm uppercase tracking-wide inline-flex items-center gap-2">
                Start 14-day free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#hero-widget" className="btn-ghost px-5 py-3 text-sm uppercase tracking-wide inline-flex items-center gap-2">
                Try the live widget
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
              {[
                ["~3 min to embed", Bolt],
                ["Your prices, your rules", Wrench],
                ["Captures real bookings", BadgeCheck],
                ["Works on any website", Code2],
              ].map(([label, Icon]) => (
                <li key={label as string} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-safetydk" />
                  <span className="font-medium">{label as string}</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="hero-widget" className="relative">
            <div className="absolute -top-4 -left-3 stamp bg-paper">Live · runs on this page</div>
            <QuoteWidget rules={rules} />
            <div className="mt-3 flex items-center gap-2 text-xs text-sub">
              <Phone className="w-3.5 h-3.5" />
              <span>
                Real engine. Real database. Submitted leads show up in
                <Link href="/dashboard/leads" className="underline font-semibold text-ink"> /dashboard/leads</Link>.
              </span>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y-2 border-ink bg-ink text-paper overflow-hidden">
          <div className="marquee-track flex gap-12 whitespace-nowrap py-3 text-sm tracking-[0.2em] uppercase font-mono">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12 shrink-0">
                <span>10 yd · 15 yd · 20 yd · 30 yd · 40 yd</span>
                <span>★</span>
                <span>Drop-in widget</span>
                <span>★</span>
                <span>No CRM rip-out</span>
                <span>★</span>
                <span>Built for roll-off ops</span>
                <span>★</span>
                <span>$29/mo · cancel anytime</span>
                <span>★</span>
                <span>Powered by BinQuote</span>
                <span>★</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="max-w-[1240px] mx-auto px-5 md:px-8 py-20">
        <div className="grid md:grid-cols-[1fr_1.6fr] gap-10">
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-sub">Section 01</div>
            <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tightest mt-2 leading-[0.95]">
              The fastest path from <span className="italic">website visit</span> to <span className="text-safetydk">deposit paid.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Paste one line.", b: "A single <script> tag. Works on Wix, Squarespace, WordPress, GoDaddy, or a hand-coded site." },
              { n: "02", t: "Visitor builds quote.", b: "Size, debris, ZIP, days. Quote updates live in big type — no “call us” friction." },
              { n: "03", t: "Lead lands in your inbox.", b: "Email + SMS notification (Pro). Full breakdown saved so you can confirm and dispatch." },
            ].map((s) => (
              <div key={s.n} className="border-2 border-ink bg-paperdark/40 p-5">
                <div className="font-mono text-xs tracking-[0.2em] text-safetydk">{s.n}</div>
                <div className="font-display text-2xl font-semibold mt-1 leading-tight">{s.t}</div>
                <p className="text-sm text-ink2 mt-2 leading-snug">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTRAST: phone vs widget */}
      <section className="bg-ink text-paper border-y-2 border-ink py-20">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-10">
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">The old way</div>
            <div className="font-display text-5xl font-semibold leading-tight mt-2">
              <span className="line-through opacity-60">"Call us for a quote."</span>
            </div>
            <ul className="mt-6 space-y-2 text-paper/80">
              <li>— Voicemail at 7 p.m., 6 a.m., Sunday afternoon.</li>
              <li>— Customer calls 3 competitors, picks whoever answers first.</li>
              <li>— You spend 12 minutes giving the same quote ten times a day.</li>
              <li>— No record. No data. No follow-up.</li>
            </ul>
          </div>
          <div className="border-2 border-paper p-7">
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-safety">The BinQuote way</div>
            <div className="font-display text-5xl font-semibold leading-tight mt-2">
              Instant. Honest. Yours.
            </div>
            <ul className="mt-6 space-y-2 text-paper/90">
              <li className="flex gap-2"><Truck className="w-4 h-4 mt-1 text-safety shrink-0" /> Your exact pricing rules — base, tonnage, overage, zones, days, debris modifiers.</li>
              <li className="flex gap-2"><BadgeCheck className="w-4 h-4 mt-1 text-safety shrink-0" /> Estimate-with-disclaimer copy operators actually trust.</li>
              <li className="flex gap-2"><Bolt className="w-4 h-4 mt-1 text-safety shrink-0" /> Live recalc. Lead capture. Hard receipt-style breakdown.</li>
              <li className="flex gap-2"><Code2 className="w-4 h-4 mt-1 text-safety shrink-0" /> Drop-in <code className="bg-paper text-ink px-1 font-mono text-[12px]">&lt;script&gt;</code> — no full CRM switch.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-[1240px] mx-auto px-5 md:px-8 py-20">
        <div className="font-mono text-xs tracking-[0.2em] uppercase text-sub">Section 02</div>
        <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tightest mt-2 leading-[0.95]">
          Priced for the indie operator.
        </h2>
        <p className="mt-3 text-ink2 max-w-[55ch]">
          The full-CRM platforms charge $99–$1,500/mo and demand you switch your whole business
          onto them. BinQuote is the widget, nothing else, at indie-operator prices.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { name: "Starter", price: "29", tag: "Widget only", features: ["1 operator", "Branded \"Powered by\"", "Lead inbox", "Email notifications", "Unlimited quotes"] },
            { name: "Pro", price: "79", tag: "Most popular", features: ["Everything in Starter", "White-label widget", "SMS notifications (Twilio)", "Stripe Connect deposits", "Up to 3 zones", "CSV export"], highlight: true },
            { name: "Setup", price: "199", tag: "One-time add-on", features: ["We import your rate card", "Embed install on your site", "Brand color & typography match", "30-min live training"] },
          ].map((p) => (
            <div
              key={p.name}
              className={`border-2 border-ink p-6 ${p.highlight ? "bg-safety/15 shadow-hardlg" : "bg-[#FFFCF6]"}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-display text-2xl font-semibold">{p.name}</div>
                <div className="chip">{p.tag}</div>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl font-semibold tracking-tightest tnum">${p.price}</span>
                <span className="text-sub font-mono text-sm">{p.name === "Setup" ? " once" : "/mo"}</span>
              </div>
              <ul className="mt-5 space-y-1.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><BadgeCheck className="w-4 h-4 text-safetydk mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRATE */}
      <section id="integrate" className="bg-paperdark/50 border-y-2 border-ink py-20 paper-grain">
        <div className="max-w-[1240px] mx-auto px-5 md:px-8 grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="font-mono text-xs tracking-[0.2em] uppercase text-sub">Section 03</div>
            <h2 className="font-display text-5xl md:text-6xl font-semibold tracking-tightest mt-2 leading-[0.95]">
              One line of code.
            </h2>
            <p className="mt-3 text-ink2 max-w-[55ch]">
              Paste this anywhere on your website. It loads a sandboxed iframe, auto-resizes
              to fit your layout, and posts every lead straight to your BinQuote inbox.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/demo" className="btn-primary px-4 py-2.5 text-sm uppercase tracking-wide">
                See it embedded on a fake operator site →
              </Link>
              <Link href="/signup" className="btn-ghost px-4 py-2.5 text-sm uppercase tracking-wide">
                Start free trial
              </Link>
            </div>
          </div>
          <div className="border-2 border-ink bg-ink text-paper p-5 font-mono text-[13px] leading-relaxed shadow-hardlg overflow-x-auto">
            <div className="text-paper/60 mb-2">{`<!-- Place where you want the widget to appear -->`}</div>
            <div>
              <span className="text-safety">{"<script"}</span>{" "}
              <span className="text-paper/90">src</span>=
              <span className="text-mint">"https://yourdomain.com/embed.js"</span>{" "}
              <span className="text-paper/90">data-binquote</span>=
              <span className="text-mint">"ironside-hauling"</span>{" "}
              <span className="text-paper/90">defer</span>
              <span className="text-safety">{"></script>"}</span>
            </div>
            <div className="dashed-rule my-3 opacity-30" />
            <div className="text-paper/70 text-xs">
              Replace <span className="text-mint">"ironside-hauling"</span> with your operator slug.
              Works on Wix, Squarespace, WordPress, Webflow, GoDaddy, raw HTML, or any CMS that
              allows a single <code className="text-safety">{`<script>`}</code> tag.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-[1240px] mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border-2 border-ink bg-safety grid place-items-center font-display font-bold leading-none">B</div>
          <div className="font-display font-semibold">BinQuote</div>
          <span className="chip">© {new Date().getFullYear()}</span>
        </div>
        <div className="text-sub flex items-center gap-4">
          <Link href="/login" className="hover:text-ink">Sign in</Link>
          <Link href="/signup" className="hover:text-ink">Start free trial</Link>
          <span>Demo: <span className="font-mono text-ink">{rules.operator_slug}</span></span>
        </div>
      </footer>
    </main>
  );
}
