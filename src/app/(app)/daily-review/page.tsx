import Link from "next/link";

import { tradesByDay } from "@/lib/analytics";
import { fetchTrades } from "@/lib/trade-queries";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export default async function DailyReviewIndexPage() {
  const trades = await fetchTrades();
  const byDay = tradesByDay(trades);
  const days = [...byDay.keys()].sort((a, b) => b.localeCompare(a)).slice(0, 48);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Rhythm</div>
        <div className="text-3xl font-semibold tracking-tight">Daily review</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          Pick a session to zoom into stats, mindset notes, and mistakes without drowning in widgets.
        </div>
      </div>

      {days.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="text-lg font-semibold">No trading days yet</div>
          <div className="mt-2 text-sm text-muted-foreground">Once trades exist, your days collect context automatically.</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.map((d) => {
            const agg = byDay.get(d)!;
            return (
              <Link key={d} href={`/daily-review/${d}`}>
                <Card className="rounded-xl border-border bg-card transition-colors hover:bg-muted/15">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{d}</CardTitle>
                    <CardDescription>
                      {agg.trades} trades · W {agg.wins} / L {agg.losses}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={`text-lg font-semibold ${agg.pnl > 0 ? "text-[hsl(var(--profit))]" : agg.pnl < 0 ? "text-[hsl(var(--loss))]" : ""}`}>
                    {formatMoney(agg.pnl)}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
