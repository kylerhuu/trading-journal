"use client";

import {
  calculateDashboardStats,
  equityCurve,
  monthlyPnLSeries,
  topMistakes,
  weekdayPerformance,
} from "@/lib/trades/analytics";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { useTrades } from "@/components/trades/trades-provider";

export function DashboardView() {
  const { trades, loading } = useTrades();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading trades…</p>;
  }

  const summary = calculateDashboardStats(trades);
  const monthly = monthlyPnLSeries(trades);
  const equity = equityCurve(trades);
  const weekday = weekdayPerformance(trades);
  const mistakes = topMistakes(trades);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Overview</div>
        <div className="text-3xl font-semibold tracking-tight">Dashboard</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          One glance at discipline and drift. Colors stay restrained until they surface outcomes.
        </div>
      </div>

      <DashboardClient
        summary={summary}
        monthly={monthly}
        equity={equity}
        weekday={weekday}
        mistakes={mistakes}
        empty={trades.length === 0}
      />
    </div>
  );
}
