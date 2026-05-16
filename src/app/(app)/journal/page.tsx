import { Suspense } from "react";

import { JournalViews } from "@/components/journal/journal-views";
import { fetchTrades } from "@/lib/trade-queries";

export default async function JournalPage() {
  const trades = await fetchTrades();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Journal</div>
        <div className="text-3xl font-semibold tracking-tight">Calendar and ledger</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          Toggle views without losing filters. Built for fast glance reviews like Linear issue queues.
        </div>
      </div>

      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading journal…</div>}>
        <JournalViews trades={trades} />
      </Suspense>
    </div>
  );
}
