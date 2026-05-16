"use client";

import { TradeTable } from "@/components/journal/trade-table";
import { useTrades } from "@/components/trades/trades-provider";

export function TradesListView() {
  const { trades, loading } = useTrades();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading trades…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Ledger</div>
        <div className="text-3xl font-semibold tracking-tight">Trades</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          Interactive table with filters — synced with your journal.
        </div>
      </div>
      <TradeTable trades={trades} />
    </div>
  );
}
