import Link from "next/link";

import { fetchTrades } from "@/lib/trade-queries";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MonthlyReviewIndexPage() {
  const trades = await fetchTrades();
  const months = [...new Set(trades.map((t) => t.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Cadence</div>
        <div className="text-3xl font-semibold tracking-tight">Monthly review</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          Zoom out like Notion recap pages: fewer gauges, more signal on setups and streaks.
        </div>
      </div>

      {months.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="text-lg font-semibold">No months yet</div>
          <div className="mt-2 text-sm text-muted-foreground">Start logging trades to unlock monthly retrospectives.</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {months.map((m) => (
            <Link key={m} href={`/monthly-review/${m}`}>
              <Card className="rounded-xl border-border bg-card transition-colors hover:bg-muted/15">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{m}</CardTitle>
                  <CardDescription>Open recap</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Heatmaps, weekly totals, mistake concentration.</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
