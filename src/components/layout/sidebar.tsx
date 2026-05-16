"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", match: (p: string) => p === "/dashboard" },
  {
    href: "/journal",
    label: "Journal",
    match: (p: string, tab: string | null) => p === "/journal" && tab !== "calendar",
  },
  {
    href: "/journal?tab=calendar",
    label: "Calendar",
    match: (p: string, tab: string | null) => p === "/journal" && tab === "calendar",
  },
  { href: "/trades", label: "Trades", match: (p: string) => p.startsWith("/trades") },
  {
    href: "/daily-review",
    label: "Daily Review",
    match: (p: string) => p.startsWith("/daily-review"),
  },
  {
    href: "/monthly-review",
    label: "Monthly Review",
    match: (p: string) => p.startsWith("/monthly-review"),
  },
  { href: "/settings", label: "Settings", match: (p: string) => p.startsWith("/settings") },
];

export function Sidebar() {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-border bg-background/60 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col px-4 py-6">
        <Link href="/dashboard" className="group mb-8 px-2">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Studio</div>
          <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">Trading Journal</div>
          <div className="mt-1 text-xs text-muted-foreground group-hover:text-muted-foreground/90">
            Clear logs. Sharper edges.
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const highlighted = item.match(pathname, tab);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground",
                  highlighted && "bg-muted/40 text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-medium text-foreground">Focus mode</div>
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Keep screenshots annotated. Notes beat indicators.
          </div>
        </div>
      </div>
    </aside>
  );
}
