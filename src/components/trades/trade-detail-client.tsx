"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { TradeDetail } from "@/components/trades/trade-detail";
import { useTrades } from "@/components/trades/trades-provider";
import type { Trade } from "@/types/database";

export function TradeDetailClient({
  tradeId,
  initialTrade,
}: {
  tradeId: string;
  initialTrade: Trade | null;
}) {
  const router = useRouter();
  const { getTradeById, loadScreenshots, refresh, loading } = useTrades();
  const [screenshots, setScreenshots] = React.useState<import("@/types/database").TradeScreenshot[]>([]);

  const trade = getTradeById(tradeId) ?? initialTrade;

  React.useEffect(() => {
    if (!tradeId) return;
    let cancelled = false;
    void loadScreenshots(tradeId).then((shots) => {
      if (!cancelled) setScreenshots(shots);
    });
    return () => {
      cancelled = true;
    };
  }, [tradeId, loadScreenshots]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading trade…</p>;
  }

  if (!trade) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="text-lg font-semibold">Trade not found</div>
        <p className="mt-2 text-sm text-muted-foreground">
          <Link href="/trades" className="underline underline-offset-4">
            Back to trades
          </Link>
        </p>
      </div>
    );
  }

  return (
    <TradeDetail
      trade={trade}
      screenshots={screenshots}
      onScreenshotsChange={() => {
        void refresh().then(() =>
          loadScreenshots(tradeId).then(setScreenshots),
        );
        router.refresh();
      }}
    />
  );
}
