# BinQuote

> The drop-in instant-quote widget for independent dumpster haulers.

A self-contained Next.js MVP that demonstrates a SaaS pricing/quote/lead-capture product targeted at small roll-off dumpster operators. Three surfaces in one app:

1. **`/`** — marketing landing page with the live widget embedded directly in the hero.
2. **`/dashboard`** — operator UI: overview, pricing rules editor (JSON + live preview), leads inbox, embed code.
3. **`/widget/[slug]`** — the embeddable widget (also linkable as a standalone page).
4. **`/demo`** — a fake operator website ("Ironside Hauling Co.") with the BinQuote widget embedded via the public `embed.js` snippet, proving the integration story.

Built as a "remarkable MVP" — production-grade engine, polished UI, end-to-end working flow against a local SQLite database. No external services required.

---

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind v3**
- **SQLite** via `better-sqlite3` (single file at `data/binquote.db`, created on first request)
- **Zod** for API validation
- **lucide-react** icons, **Geist** + **Fraunces** typography (CDN)

Pricing logic lives in [`src/lib/quote-engine.ts`](src/lib/quote-engine.ts) — a pure, deterministic function. Same engine powers the live widget, the dashboard preview, and lead capture.

## Get it running

```bash
cd ~/repos/binquote
npm install
npm run dev
# → http://localhost:3030
```

First request creates `data/binquote.db` and seeds the demo operator `ironside-hauling`.

To wipe and re-seed:

```bash
rm -rf data/
npm run seed
```

## Try the end-to-end flow

1. Open **http://localhost:3030/** — change the size/debris/ZIP and watch the quote update live in big type.
2. Click **Reserve this dumpster →**, fill in name/phone/email, submit.
3. Go to **http://localhost:3030/dashboard/leads** — your lead is there with the full quote breakdown.
4. Visit **http://localhost:3030/dashboard/pricing** — edit the JSON rate card; the preview widget on the right recalculates instantly. Click **Save** to push to the DB.
5. Open **http://localhost:3030/demo** — see the same widget embedded into a fake operator's website via a single `<script>` tag.

## How a real operator would integrate

Paste this anywhere on their site:

```html
<script src="https://yourdomain.com/embed.js" data-binquote="ironside-hauling" defer></script>
```

The script injects a sandboxed iframe pointing at `/widget/<slug>` and listens for `postMessage` height updates to auto-resize.

## Project layout

```
src/
├── app/
│   ├── page.tsx                 # Marketing landing (with live widget in hero)
│   ├── dashboard/               # Operator UI (overview, pricing, leads, embed)
│   ├── widget/[slug]/page.tsx   # Iframeable widget page
│   ├── demo/page.tsx            # Fake operator site with embed snippet
│   ├── embed.js/route.ts        # Public embed loader script
│   └── api/
│       ├── quote/route.ts       # POST  → calculate quote
│       ├── leads/route.ts       # POST → capture lead · GET → list
│       ├── leads/[id]/route.ts  # PATCH → status update
│       └── pricing/route.ts     # GET / PUT pricing rules
├── components/
│   ├── QuoteWidget.tsx          # The widget UI (live quote + lead capture)
│   ├── EmbedFrame.tsx           # Iframe wrapper that posts height up
│   ├── PricingEditor.tsx        # JSON editor + live preview
│   ├── LeadsTable.tsx           # Leads inbox with detail panel
│   └── EmbedSnippet.tsx         # Copy-to-clipboard snippet block
└── lib/
    ├── types.ts                 # PricingRules, Quote, Lead
    ├── quote-engine.ts          # Pure pricing calculation
    ├── db.ts                    # SQLite + queries
    ├── seed-defaults.ts         # Demo operator (Ironside Hauling Co.)
    └── seed.ts                  # `npm run seed`
```

## Pricing model (the engine)

```
quote =  base_haul(size)
       + zone.delivery_fee
       + debris.base_adjust
       + overage_per_ton × max(0, est_tons + debris.tons_adjust − size.tons_included)
       + size.day_overage × max(0, rental_days − size.rental_days)
       + tax
```

Every variable is operator-configurable, so quotes are as accurate as the operator's own rate card. No national landfill-fee database required — the operator's `base_haul` already absorbs their actual disposal cost.

## What's intentionally NOT in this MVP

- Auth (single demo operator hardcoded — multi-tenant is trivial to add)
- Stripe Connect / deposit collection
- Twilio SMS notifications
- The LLM-assisted rate-sheet PDF import (the killer onboarding feature in the pitch)
- Production deployment config (Dockerfile, env handling)
- Multi-operator signup flow

These are the obvious next steps. The widget engine, the embed pipeline, and the lead-capture loop are all real and working.
