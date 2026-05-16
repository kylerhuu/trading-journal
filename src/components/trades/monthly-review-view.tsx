"use client";

import Link from "next/link";
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";

import { calculateCalendarStats, calculateMonthlyStats } from "@/lib/trades/analytics";
import { formatMoney } from "@/lib/format";

import { useTrades } from "@/components/trades/trades-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function rgbaHeat(pnl: number | undefined, maxAbs: number) {
  if (pnl == null) return "rgba(148,163,184,0.10)";
  const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
  const alpha = 0.1 + intensity * 0.55;
  if (pnl > 0) return `rgba(34,197,94,${alpha})`;
  if (pnl < 0) return `rgba(239,68,68,${alpha})`;
  return "rgba(148,163,184,0.12)";
}

export function MonthlyReviewIndexView() {
  const { trades, loading } = useTrades();
  const months = [...new Set(trades.map((t) => t.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a));

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Cadence</div>
        <div className="text-3xl font-semibold tracking-tight">Monthly review</div>
      </div>
      {months.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No months with trades yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {months.map((m) => (
            <Link key={m} href={`/monthly-review/${m}`}>
              <Card className="rounded-xl border-border bg-card transition-colors hover:bg-muted/15">
                <CardHeader>
                  <CardTitle>{m}</CardTitle>
                  <CardDescription>Open recap</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MonthlyReviewMonthView({ month }: { month: string }) {
  const { trades, loading } = useTrades();
  const monthDate = new Date(`${month}-01T12:00:00`);
  const metrics = calculateMonthlyStats(monthDate, trades);
  const monthTrades = trades.filter((t) => t.date.startsWith(month));
  const byDay = calculateCalendarStats(monthTrades);
  const maxAbs = Math.max(1, ...[...byDay.values()].map((v) => Math.abs(v.pnl)));

  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start, end });
  const leading = (getDay(start) + 6) % 7;
  const cells: Array<{ key: string | null; date: Date | null }> = [];
  for (let i = 0; i < leading; i++) cells.push({ key: null, date: null });
  for (const d of days) cells.push({ key: format(d, "yyyy-MM-dd"), date: d });
  while (cells.length % 7 !== 0) cells.push({ key: null, date: null });
  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const rawGoal = Number(process.env.NEXT_PUBLIC_MONTHLY_GOAL_USD ?? process.env.MONTHLY_GOAL_USD ?? "5000");
  const goalUsd = Number.isFinite(rawGoal) && rawGoal > 0 ? rawGoal : 5000;
  const progressPct = goalUsd > 0 ? Math.max(0, Math.min(100, Math.round((metrics.monthlyPnL / goalUsd) * 100))) : 0;

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Monthly recap</div>
        <div className="text-3xl font-semibold tracking-tight">{month}</div>
        <Link href="/monthly-review" className="text-sm text-muted-foreground underline underline-offset-4">
          All months
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly P/L</CardTitle>
          </CardHeader>
          <CardContent
            className={`text-4xl font-semibold ${metrics.monthlyPnL > 0 ? "text-[hsl(var(--profit))]" : metrics.monthlyPnL < 0 ? "text-[hsl(var(--loss))]" : ""}`}
          >
            {formatMoney(metrics.monthlyPnL)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Goal progress</CardTitle>
            <CardDescription>Target ${goalUsd.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{progressPct}%</div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Weekly breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.weeklyBreakdown.map((w) => (
              <div key={w.weekLabel} className="flex justify-between rounded-lg border border-border bg-muted/10 px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">{w.weekLabel}</span>
                <span className={w.pnl >= 0 ? "text-[hsl(var(--profit))]" : "text-[hsl(var(--loss))]"}>
                  {formatMoney(w.pnl)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Best day" value={metrics.bestDay ? `${metrics.bestDay.date} (${formatMoney(metrics.bestDay.pnl)})` : "—"} />
            <Row label="Worst day" value={metrics.worstDay ? `${metrics.worstDay.date} (${formatMoney(metrics.worstDay.pnl)})` : "—"} />
            <Separator />
            <Row label="Best setup" value={metrics.bestSetup ?? "—"} />
            <Row label="Least profitable setup" value={metrics.worstSetup ?? "—"} />
            <Separator />
            <Row label="Most common mistake" value={metrics.mostCommonMistake ?? "—"} />
            <Row label="Avg daily P/L" value={formatMoney(metrics.avgDailyPnL)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar heatmap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-7 gap-2 text-[11px] font-medium text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-7 gap-2">
              {row.map((cell, cellIdx) => {
                if (!cell.date || !cell.key) return <div key={`b-${idx}-${cellIdx}`} className="aspect-square" />;
                const agg = byDay.get(cell.key);
                const pnl = agg?.pnl;
                return (
                  <Link
                    key={cell.key}
                    href={`/daily-review/${cell.key}`}
                    className="aspect-square rounded-lg border border-border/60 p-2 text-[10px]"
                    style={{ backgroundColor: rgbaHeat(pnl, maxAbs) }}
                  >
                    <div className="font-semibold">{format(cell.date, "d")}</div>
                  </Link>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
