import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  SlidersHorizontal,
  Inbox,
  Code2,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { currentOperator } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const op = await currentOperator();
  if (!op) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="grid h-8 w-8 place-items-center border-2 border-ink font-display text-sm font-bold leading-none text-white"
                style={{ background: op.brand_color }}
              >
                {op.business_name[0]?.toUpperCase() || "B"}
              </div>
              <div className="font-display tracking-tightest text-lg font-semibold">
                {op.business_name}
              </div>
            </Link>
            <span className="chip">
              {op.plan === "trial" ? "Trial" : op.plan === "pro" ? "Pro" : "Starter"} · {op.slug}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/widget/${op.slug}`}
              target="_blank"
              className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              Preview widget <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[1380px] flex-1 grid-cols-[200px_1fr] gap-8 px-5 py-6 md:px-8">
        <aside className="-ml-2 border-r-2 border-ink pl-2 pr-6">
          <ul className="sticky top-6 space-y-1">
            {[
              { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
              { href: "/dashboard/pricing", label: "Pricing rules", icon: SlidersHorizontal },
              { href: "/dashboard/leads", label: "Leads", icon: Inbox },
              { href: "/dashboard/embed", label: "Embed code", icon: Code2 },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center gap-2 border-2 border-transparent px-3 py-2 font-medium hover:border-ink hover:bg-paperdark/50"
                >
                  <l.icon className="text-safetydk h-4 w-4" /> {l.label}
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
