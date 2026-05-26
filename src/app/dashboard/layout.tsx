import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, SlidersHorizontal, Inbox, Code2, ExternalLink } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="border-b-2 border-ink">
        <div className="max-w-[1380px] mx-auto px-5 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-ink bg-safety grid place-items-center font-display font-bold leading-none text-sm">B</div>
              <div className="font-display text-lg tracking-tightest font-semibold">BinQuote</div>
            </Link>
            <span className="chip">Dashboard · ironside-hauling</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost px-3 py-1.5 text-xs inline-flex items-center gap-1">
              Marketing site <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link href="/demo" className="btn-primary px-3 py-1.5 text-xs">View widget on mock site</Link>
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-[1380px] w-full mx-auto px-5 md:px-8 py-6 grid grid-cols-[200px_1fr] gap-8">
        <aside className="border-r-2 border-ink pr-6 -ml-2 pl-2">
          <ul className="space-y-1 sticky top-6">
            {[
              { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
              { href: "/dashboard/pricing", label: "Pricing rules", icon: SlidersHorizontal },
              { href: "/dashboard/leads", label: "Leads", icon: Inbox },
              { href: "/dashboard/embed", label: "Embed code", icon: Code2 },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center gap-2 px-3 py-2 border-2 border-transparent hover:border-ink hover:bg-paperdark/50 font-medium"
                >
                  <l.icon className="w-4 h-4 text-safetydk" /> {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
