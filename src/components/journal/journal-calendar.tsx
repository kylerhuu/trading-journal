"use client";

import Link from "next/link";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import * as React from "react";

import type { Trade } from "@/types/database";

import { tradesByDay } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function JournalCalendar({ trades }: { trades: Trade[] }) {
  const [cursor, setCursor] = React.useState(() => startOfMonth(new Date()));

  const byDay = React.useMemo(() => tradesByDay(trades), [trades]);

  const matrix = React.useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const days = eachDayOfInterval({ start, end });

    const leading = (getDay(start) + 6) % 7;
    const cells: Array<{ key: string | null; date: Date | null }> = [];

    for (let i = 0; i < leading; i++) cells.push({ key: null, date: null });
    for (const d of days) {
      cells.push({ key: format(d, "yyyy-MM-dd"), date: d });
    }

    while (cells.length % 7 !== 0) cells.push({ key: null, date: null });

    const rows: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

    return rows;
  }, [cursor]);

  const title = format(cursor, "MMMM yyyy");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setCursor((d) => addMonths(d, -1))}>
            Prev
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setCursor((d) => addMonths(d, 1))}>
            Next
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border-border bg-card p-4">
        <div className="grid grid-cols-7 gap-2 pb-3 text-xs font-medium text-muted-foreground">
          {WEEK_LABELS.map((d) => (
            <div key={d} className="px-2">
              {d}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {matrix.map((row, idx) => (
            <div key={idx} className="grid grid-cols-7 gap-2">
              {row.map((cell, cellIdx) => {
                if (!cell.date || !cell.key) return <div key={`blank-${idx}-${cellIdx}`} className="min-h-[92px]" />;

                const agg = byDay.get(cell.key);
                const has = !!agg && agg.trades > 0;

                const tone =
                  !has ? "bg-muted/10 border-border/60" : agg!.pnl > 0 ? "bg-[hsl(var(--profit)/0.12)] border-[hsl(var(--profit)/0.35)]" : agg!.pnl < 0 ? "bg-[hsl(var(--loss)/0.12)] border-[hsl(var(--loss)/0.35)]" : "bg-muted/15 border-border";

                return (
                  <Link
                    key={cell.key}
                    href={`/daily-review/${cell.key}`}
                    className={cn(
                      "min-h-[92px] rounded-xl border px-3 py-2 transition-colors hover:bg-muted/25",
                      tone,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-foreground">{format(cell.date, "d")}</div>
                      <div className="text-[11px] text-muted-foreground">{has ? `${agg!.trades} tx` : ""}</div>
                    </div>

                    {has ? (
                      <div className="mt-2 space-y-1">
                        <div className={cn("text-sm font-semibold", agg!.pnl > 0 && "text-[hsl(var(--profit))]", agg!.pnl < 0 && "text-[hsl(var(--loss))]")}>
                          {formatMoney(agg!.pnl)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          W {agg!.wins} / L {agg!.losses}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-[11px] text-muted-foreground">No trades</div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
