"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { AddTradeDialog } from "@/components/trades/add-trade-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function titleFromPath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/journal")) return "Journal";
  if (pathname.startsWith("/trades")) return "Trades";
  if (pathname.startsWith("/daily-review")) return "Daily Review";
  if (pathname.startsWith("/monthly-review")) return "Monthly Review";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Trading Journal";
}

export function TopBar() {
  const pathname = usePathname();
  const title = titleFromPath(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4 lg:px-8">
        <div className="lg:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation">
                <Menu />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Navigate</DialogTitle>
              </DialogHeader>
              <MobileLinks />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="truncate text-sm font-semibold tracking-tight">{title}</div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            Quiet workspace for deliberate reps.
          </div>
        </div>

        <div className="hidden flex-1 justify-center sm:flex">
          <div className="w-full max-w-md rounded-full border border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            Search trades (wire Supabase filters next)
          </div>
        </div>

        <AddTradeDialog />
      </div>
    </header>
  );
}

function MobileLinks() {
  const links = [
    ["/dashboard", "Dashboard"],
    ["/journal", "Journal"],
    ["/journal?tab=calendar", "Calendar"],
    ["/trades", "Trades"],
    ["/daily-review", "Daily Review"],
    ["/monthly-review", "Monthly Review"],
    ["/settings", "Settings"],
  ] as const;

  return (
    <div className="flex flex-col gap-2">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm hover:bg-muted/40">
          {label}
        </Link>
      ))}
    </div>
  );
}
