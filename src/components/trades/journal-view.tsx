"use client";

import { Suspense } from "react";

import { JournalViews } from "@/components/journal/journal-views";
import { useTrades } from "@/components/trades/trades-provider";

export function JournalView() {
  const { trades, loading } = useTrades();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading journal…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Journal</div>
        <div className="text-3xl font-semibold tracking-tight">Calendar and ledger</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          Toggle views without losing filters. Built for fast glance reviews.
        </div>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading views…</p>}>
        <JournalViews trades={trades} />
      </Suspense>
    </div>
  );
}
