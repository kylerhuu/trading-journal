import type { Trade, TradeScreenshot } from "@/types/database";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

import { TradeExtraUpload } from "@/components/trades/trade-extra-upload";

const SHOT_LABEL: Record<TradeScreenshot["type"], string> = {
  before_entry: "Before entry",
  during_trade: "During trade",
  after_exit: "After exit",
  higher_timeframe: "Higher timeframe",
};

export function TradeDetail(props: { trade: Trade; screenshots: TradeScreenshot[] }) {
  const { trade, screenshots } = props;

  const timeline = [...screenshots].sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Trade review</div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-3xl font-semibold tracking-tight">{trade.symbol}</div>
            <Badge variant="outline">{trade.direction}</Badge>
            <Badge variant="secondary">{trade.date}</Badge>
          </div>
          <div className={cn("text-lg font-semibold", trade.pnl > 0 && "text-[hsl(var(--profit))]", trade.pnl < 0 && "text-[hsl(var(--loss))]")}>
            {formatMoney(trade.pnl)}
          </div>
        </div>

        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Execution stats</CardTitle>
            <CardDescription>Mechanics without narrative clutter.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat k="Entry" v={trade.entry_price.toString()} />
            <Stat k="Exit" v={trade.exit_price.toString()} />
            <Stat k="Stop" v={trade.stop_loss.toString()} />
            <Stat k="Risk" v={formatMoney(trade.risk_amount)} />
            <Stat k="R multiple" v={trade.r_multiple == null ? "-" : trade.r_multiple.toFixed(2)} />
            <Stat k="Session" v={trade.session ?? "-"} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-xl border-border bg-card xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes</CardTitle>
            <CardDescription>What mattered while clicking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Note title="Overview" body={trade.notes} />
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <Note title="Setup" body={trade.setup} />
              <Note title="Emotion" body={trade.emotion} />
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {(trade.tags ?? []).length ? (
                trade.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No tags</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(trade.mistake_tags ?? []).length ? (
                trade.mistake_tags.map((t) => (
                  <Badge key={t} variant="outline" className="border-[hsl(var(--loss)/0.35)]">
                    {t}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No mistake tags</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Review prompts</CardTitle>
            <CardDescription>Honest beats heroic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Note title="What went right" body={trade.what_went_right} />
            <Note title="What went wrong" body={trade.what_went_wrong} />
            <Note title="Lesson learned" body={trade.lesson_learned} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Screenshots timeline</CardTitle>
          <CardDescription>Story beats from chart to exit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {timeline.length === 0 ? (
            <div className="text-sm text-muted-foreground">No screenshots attached yet.</div>
          ) : (
            timeline.map((ss) => (
              <div key={ss.id} className="grid gap-4 rounded-xl border border-border bg-muted/10 p-4 lg:grid-cols-[280px_1fr]">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
                  {isRenderableScreenshotUrl(ss.image_url) ? (
                    <img
                      src={ss.image_url}
                      alt={SHOT_LABEL[ss.type]}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full min-h-[180px] items-center justify-center p-4 text-center text-xs text-muted-foreground">
                      Screenshot URL unavailable
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{SHOT_LABEL[ss.type]}</Badge>
                    <div className="text-xs text-muted-foreground">{new Date(ss.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-foreground">{ss.caption ?? "No caption"}</div>
                </div>
              </div>
            ))
          )}

          <TradeExtraUpload tradeId={trade.id} />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{k}</div>
      <div className="mt-1 text-sm font-semibold">{v}</div>
    </div>
  );
}

function isRenderableScreenshotUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function Note({ title, body }: { title: string; body: string | null }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground">{title}</div>
      <div className="text-sm leading-relaxed text-foreground">{body?.trim() ? body : <span className="text-muted-foreground">Empty</span>}</div>
    </div>
  );
}
