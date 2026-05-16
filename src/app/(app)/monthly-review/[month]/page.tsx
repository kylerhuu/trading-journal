import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

import { computeMonthlyReview, tradesByDay } from "@/lib/analytics";
import { fetchTrades } from "@/lib/trade-queries";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/format";

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function rgbaHeat(pnl: number | undefined, maxAbs: number) {
  if (pnl == null) return "rgba(148,163,184,0.10)";
  const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
  const alpha = 0.10 + intensity * 0.55;
  if (pnl > 0) return `rgba(34,197,94,${alpha})`;
  if (pnl < 0) return `rgba(239,68,68,${alpha})`;
  return "rgba(148,163,184,0.12)";
}

export default async function MonthlyReviewMonthPage(props: { params: Promise<{ month: string }> }) {
  const { month } = await props.params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();

  const trades = await fetchTrades();
  const monthDate = new Date(`${month}-01T12:00:00`);
  const metrics = computeMonthlyReview(monthDate, trades);

  const monthTrades = trades.filter((t) => t.date.startsWith(month));
  const byDay = tradesByDay(monthTrades);

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

  const rawGoal = Number(process.env.MONTHLY_GOAL_USD ?? "5000");
  const goalUsd = Number.isFinite(rawGoal) && rawGoal > 0 ? rawGoal : 5000;
  const progressPct = goalUsd > 0 ? Math.max(0, Math.min(100, Math.round((metrics.monthlyPnL / goalUsd) * 100))) : 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Monthly recap</div>
        <div className="text-3xl font-semibold tracking-tight">{month}</div>
        <div className="text-sm text-muted-foreground">
          Jump around months via{" "}
          <Link className="underline underline-offset-4" href="/monthly-review">
            index
          </Link>
          .
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly P/L</CardTitle>
            <CardDescription>Outcome without ticker chrome.</CardDescription>
          </CardHeader>
          <CardContent className={`text-4xl font-semibold tracking-tight ${metrics.monthlyPnL > 0 ? "text-[hsl(var(--profit))]" : metrics.monthlyPnL < 0 ? "text-[hsl(var(--loss))]" : ""}`}>
            {formatMoney(metrics.monthlyPnL)}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Goal progress</CardTitle>
            <CardDescription>
              Target ${goalUsd.toLocaleString()} via <span className="font-mono">MONTHLY_GOAL_USD</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{progressPct}% of monthly goal</div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-xl border-border bg-card xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly breakdown</CardTitle>
            <CardDescription>Totals grouped by ISO week label.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.weeklyBreakdown.length === 0 ? (
              <div className="text-sm text-muted-foreground">No trades this month.</div>
            ) : (
              metrics.weeklyBreakdown.map((w) => (
                <div key={w.weekLabel} className="flex items-center justify-between rounded-xl border border-border bg-muted/10 px-4 py-3">
                  <div className="font-mono text-xs text-muted-foreground">{w.weekLabel}</div>
                  <div className={`text-sm font-semibold ${w.pnl > 0 ? "text-[hsl(var(--profit))]" : w.pnl < 0 ? "text-[hsl(var(--loss))]" : ""}`}>
                    {formatMoney(w.pnl)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Highlights</CardTitle>
            <CardDescription>Setups and slip-ups.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Best day" value={metrics.bestDay ? `${metrics.bestDay.date} (${formatMoney(metrics.bestDay.pnl)})` : "—"} />
            <Row label="Worst day" value={metrics.worstDay ? `${metrics.worstDay.date} (${formatMoney(metrics.worstDay.pnl)})` : "—"} />
            <Separator />
            <Row label="Best setup" value={metrics.bestSetup ?? "—"} />
            <Row label="Least profitable setup" value={metrics.worstSetup ?? "—"} />
            <Separator />
            <Row label="Most common mistake" value={metrics.mostCommonMistake ?? "—"} />
            <Row label="Average daily P/L" value={formatMoney(metrics.avgDailyPnL)} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Calendar heatmap</CardTitle>
          <CardDescription>Intensity scales with absolute daily P/L.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-7 gap-2 pb-2 text-[11px] font-medium text-muted-foreground">
            {WEEK_LABELS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-7 gap-2">
                {row.map((cell, cellIdx) => {
                  if (!cell.date || !cell.key) return <div key={`blank-${idx}-${cellIdx}`} className="aspect-square" />;

                  const agg = byDay.get(cell.key);
                  const pnl = agg?.pnl;

                  return (
                    <Link
                      key={cell.key}
                      href={`/daily-review/${cell.key}`}
                      className="aspect-square rounded-lg border border-border/60 p-2 transition-colors hover:border-border"
                      style={{ backgroundColor: rgbaHeat(pnl, maxAbs) }}
                    >
                      <div className="text-[11px] font-semibold text-foreground">{format(cell.date, "d")}</div>
                      <div className="mt-2 text-[10px] text-foreground/80">{agg?.trades ? `${agg.trades} tx` : ""}</div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-right font-medium text-foreground">{value}</div>
    </div>
  );
}
