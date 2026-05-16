"use client";

import Link from "next/link";

import { calculateDayStats } from "@/lib/trades/analytics";
import { formatMoney, formatPct } from "@/lib/format";

import { useTrades } from "@/components/trades/trades-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function DailyReviewDayView({ date }: { date: string }) {
  const { trades, loading } = useTrades();

  const tradesOnDay = trades
    .filter((t) => t.date === date)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const stats = calculateDayStats(tradesOnDay);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Daily review</div>
        <div className="text-3xl font-semibold tracking-tight">{date}</div>
        <div className="text-sm text-muted-foreground">
          <Link className="underline underline-offset-4" href="/daily-review">
            All days
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MiniStat title="Total P/L" value={formatMoney(stats.totalPnL)} accent={stats.totalPnL > 0 ? "win" : stats.totalPnL < 0 ? "loss" : "flat"} />
        <MiniStat title="Trades" value={String(stats.trades)} />
        <MiniStat title="Win rate" value={formatPct(stats.winRate)} />
        <MiniStat title="Biggest win" value={formatMoney(stats.biggestWin)} accent={stats.biggestWin > 0 ? "win" : "flat"} />
        <MiniStat title="Biggest loss" value={formatMoney(stats.biggestLoss)} accent={stats.biggestLoss < 0 ? "loss" : "flat"} />
      </div>

      <Card className="rounded-xl border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Trades</CardTitle>
          <CardDescription>Click through for screenshots and reflections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tradesOnDay.length === 0 ? (
            <div className="text-sm text-muted-foreground">No trades logged for this day.</div>
          ) : (
            tradesOnDay.map((t) => (
              <Link
                key={t.id}
                href={`/trades/${t.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/10 px-4 py-3 hover:bg-muted/20"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{t.symbol}</div>
                    <Badge variant="outline">{t.direction}</Badge>
                    <Badge variant="secondary">{t.setup ?? "Setup"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{t.emotion ?? "emotion unset"}</div>
                </div>
                <div
                  className={`text-sm font-semibold ${t.pnl > 0 ? "text-[hsl(var(--profit))]" : t.pnl < 0 ? "text-[hsl(var(--loss))]" : ""}`}
                >
                  {formatMoney(t.pnl)}
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat(props: { title: string; value: string; accent?: "win" | "loss" | "flat" }) {
  const { title, value, accent } = props;
  return (
    <Card className="rounded-xl border-border bg-card">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle
          className={`text-xl font-semibold tracking-tight ${accent === "win" ? "text-[hsl(var(--profit))]" : accent === "loss" ? "text-[hsl(var(--loss))]" : ""}`}
        >
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
