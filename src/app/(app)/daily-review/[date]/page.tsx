import Link from "next/link";
import { notFound } from "next/navigation";

import { computeDayStats } from "@/lib/analytics";
import { fetchDailyReviews, fetchTrades } from "@/lib/trade-queries";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney, formatPct } from "@/lib/format";

export default async function DailyReviewDayPage(props: { params: Promise<{ date: string }> }) {
  const { date } = await props.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const trades = await fetchTrades();
  const tradesOnDay = trades.filter((t) => t.date === date).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const stats = computeDayStats(tradesOnDay);

  const reviews = await fetchDailyReviews();
  const review = reviews.find((r) => r.date === date) ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Daily review</div>
          <div className="text-3xl font-semibold tracking-tight">{date}</div>
          <div className="text-sm text-muted-foreground">
            Drill into trades or glide back to{" "}
            <Link className="underline underline-offset-4" href="/daily-review">
              all days
            </Link>
            .
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MiniStat title="Total P/L" value={formatMoney(stats.totalPnL)} accent={stats.totalPnL > 0 ? "win" : stats.totalPnL < 0 ? "loss" : "flat"} />
        <MiniStat title="Trades" value={String(stats.trades)} />
        <MiniStat title="Win rate" value={formatPct(stats.winRate)} />
        <MiniStat title="Biggest win" value={formatMoney(stats.biggestWin)} accent={stats.biggestWin > 0 ? "win" : "flat"} />
        <MiniStat title="Biggest loss" value={formatMoney(stats.biggestLoss)} accent={stats.biggestLoss < 0 ? "loss" : "flat"} />
        <MiniStat title="Discipline score" value={review?.discipline_score == null ? "—" : String(review.discipline_score)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mindset capture</CardTitle>
            <CardDescription>Optional narrative fields stored in Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Emotional rating" value={review?.emotional_rating == null ? "—" : String(review.emotional_rating)} />
            <Field label="Biggest mistake" value={review?.biggest_mistake} />
            <Field label="What I learned today" value={review?.lesson_learned} />
            <Separator />
            <Field label="Notes" value={review?.notes} />
          </CardContent>
        </Card>

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
                <Link key={t.id} href={`/trades/${t.id}`} className="flex items-center justify-between rounded-xl border border-border bg-muted/10 px-4 py-3 hover:bg-muted/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{t.symbol}</div>
                      <Badge variant="outline">{t.direction}</Badge>
                      <Badge variant="secondary">{t.setup ?? "Setup"}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{t.emotion ?? "emotion unset"}</div>
                  </div>
                  <div className={`text-sm font-semibold ${t.pnl > 0 ? "text-[hsl(var(--profit))]" : t.pnl < 0 ? "text-[hsl(var(--loss))]" : ""}`}>
                    {formatMoney(t.pnl)}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
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

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="text-sm leading-relaxed text-foreground">{value?.trim() ? value : <span className="text-muted-foreground">Empty</span>}</div>
    </div>
  );
}
