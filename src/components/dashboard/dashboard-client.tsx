"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DashboardSummary,
  EquityPoint,
  MistakeCount,
  MonthlyPnLPoint,
  WeekdayPerf,
} from "@/lib/analytics";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatPct } from "@/lib/format";

function MiniStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="rounded-xl border-border bg-card">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl font-semibold tracking-tight">{value}</CardTitle>
      </CardHeader>
      {hint ? <CardContent className="pb-4 pt-0 text-xs text-muted-foreground">{hint}</CardContent> : null}
    </Card>
  );
}

export function DashboardClient(props: {
  summary: DashboardSummary;
  monthly: MonthlyPnLPoint[];
  equity: EquityPoint[];
  weekday: WeekdayPerf[];
  mistakes: MistakeCount[];
  empty: boolean;
}) {
  const { summary, monthly, equity, weekday, mistakes, empty } = props;

  if (empty) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="text-lg font-semibold">Your desk is spotless.</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Log your first trade to unlock analytics that stay calm like Linear, not loud like a ticker tape.
        </div>
      </div>
    );
  }

  const axisStroke = "#64748b";
  const gridStroke = "#1f2937";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total trades" value={String(summary.totalTrades)} />
        <MiniStat label="Win rate" value={formatPct(summary.winRate)} />
        <MiniStat label="Total P/L" value={formatMoney(summary.totalPnL)} />
        <MiniStat label="Average R" value={summary.avgR.toFixed(2)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Average win" value={formatMoney(summary.avgWin)} />
        <MiniStat label="Average loss" value={formatMoney(-summary.avgLoss)} />
        <MiniStat
          label="Profit factor"
          value={Number.isFinite(summary.profitFactor) ? summary.profitFactor.toFixed(2) : "∞"}
        />
        <MiniStat label="Best setup" value={summary.bestSetup ?? "—"} hint={summary.worstSetup ? `Worst: ${summary.worstSetup}` : undefined} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-xl border-border bg-card xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly P/L</CardTitle>
            <CardDescription>Totals per month from your journal.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" stroke={axisStroke} tick={{ fontSize: 12 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [formatMoney(value), "P/L"]}
                />
                <Bar dataKey="pnl" radius={[10, 10, 10, 10]}>
                  {monthly.map((entry) => (
                    <Cell key={entry.month} fill={entry.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top mistakes</CardTitle>
            <CardDescription>Tags you repeat often.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mistakes.length === 0 ? (
              <div className="text-sm text-muted-foreground">No mistake tags yet.</div>
            ) : (
              mistakes.map((m) => (
                <div key={m.tag} className="flex items-center justify-between rounded-lg border border-border bg-muted/10 px-3 py-2">
                  <div className="text-sm">{m.tag}</div>
                  <div className="text-xs text-muted-foreground">{m.count}x</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Equity curve</CardTitle>
            <CardDescription>Cumulative P/L by trade sequence.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="date" stroke={axisStroke} tick={{ fontSize: 12 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ stroke: gridStroke }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [formatMoney(value), "Equity"]}
                />
                <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#eq)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekday performance</CardTitle>
            <CardDescription>Where your process actually shows up.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="weekday" stroke={axisStroke} tick={{ fontSize: 12 }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [formatMoney(value), "P/L"]}
                />
                <Bar dataKey="pnl" radius={[10, 10, 10, 10]}>
                  {weekday.map((entry) => (
                    <Cell key={entry.weekday} fill={entry.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
