"use client";

import Link from "next/link";
import * as React from "react";

import type { Trade } from "@/types/database";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "date" | "pnl" | "r_multiple" | "symbol";

function cmp(a: string | number, b: string | number) {
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  return Number(a) - Number(b);
}

export function TradeTable({ trades }: { trades: Trade[] }) {
  const [symbol, setSymbol] = React.useState("");
  const [setup, setSetup] = React.useState("");
  const [emotion, setEmotion] = React.useState("");
  const [session, setSession] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [outcome, setOutcome] = React.useState<"any" | "win" | "loss" | "flat">("any");
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const filtered = React.useMemo(() => {
    const sym = symbol.trim().toLowerCase();
    const st = setup.trim().toLowerCase();
    const em = emotion.trim().toLowerCase();
    const ses = session.trim().toLowerCase();

    return trades.filter((t) => {
      if (sym && !t.symbol.toLowerCase().includes(sym)) return false;
      if (st && !(t.setup ?? "").toLowerCase().includes(st)) return false;
      if (em && !(t.emotion ?? "").toLowerCase().includes(em)) return false;
      if (ses && !(t.session ?? "").toLowerCase().includes(ses)) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      if (outcome === "win" && !(t.pnl > 0)) return false;
      if (outcome === "loss" && !(t.pnl < 0)) return false;
      if (outcome === "flat" && !(t.pnl === 0)) return false;
      return true;
    });
  }, [trades, symbol, setup, emotion, session, from, to, outcome]);

  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av =
        sortKey === "date"
          ? a.date
          : sortKey === "symbol"
            ? a.symbol
            : sortKey === "pnl"
              ? a.pnl
              : (a.r_multiple ?? 0);
      const bv =
        sortKey === "date"
          ? b.date
          : sortKey === "symbol"
            ? b.symbol
            : sortKey === "pnl"
              ? b.pnl
              : (b.r_multiple ?? 0);
      return cmp(av, bv) * dir;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(next: SortKey) {
    if (sortKey === next) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(next);
      setSortDir(next === "date" ? "desc" : next === "symbol" ? "asc" : "desc");
    }
  }

  if (!trades.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="text-lg font-semibold">No trades yet</div>
        <div className="mt-2 text-sm text-muted-foreground">Use Add trade in the top bar.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-6">
        <div className="space-y-2 lg:col-span-2">
          <Label className="text-xs text-muted-foreground">Symbol contains</Label>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="ES, NQ" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Setup contains</Label>
          <Input value={setup} onChange={(e) => setSetup(e.target.value)} placeholder="trend, fade" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Emotion contains</Label>
          <Input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="calm" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Session contains</Label>
          <Input value={session} onChange={(e) => setSession(e.target.value)} placeholder="London" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Outcome</Label>
          <select
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as typeof outcome)}
          >
            <option value="any">Any</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="flat">Flat</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{sorted.length}</span> trades
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">
              <button type="button" className="inline-flex items-center gap-2 hover:text-foreground" onClick={() => toggleSort("date")}>
                Date
              </button>
            </TableHead>
            <TableHead>
              <button type="button" className="inline-flex items-center gap-2 hover:text-foreground" onClick={() => toggleSort("symbol")}>
                Symbol
              </button>
            </TableHead>
            <TableHead>Dir</TableHead>
            <TableHead>Setup</TableHead>
            <TableHead>Emotion</TableHead>
            <TableHead>Session</TableHead>
            <TableHead className="text-right">
              <button type="button" className="ml-auto inline-flex items-center gap-2 hover:text-foreground" onClick={() => toggleSort("pnl")}>
                P/L
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button type="button" className="ml-auto inline-flex items-center gap-2 hover:text-foreground" onClick={() => toggleSort("r_multiple")}>
                R
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((t) => (
            <TableRow key={t.id} className="cursor-pointer">
              <TableCell className="font-medium">
                <Link href={`/trades/${t.id}`} className="block">
                  {t.date}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/trades/${t.id}`} className="block font-semibold tracking-tight">
                  {t.symbol}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{t.direction}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{t.setup ?? "-"}</TableCell>
              <TableCell className="text-muted-foreground">{t.emotion ?? "-"}</TableCell>
              <TableCell className="text-muted-foreground">{t.session ?? "-"}</TableCell>
              <TableCell className={cn("text-right font-semibold", t.pnl > 0 && "text-[hsl(var(--profit))]", t.pnl < 0 && "text-[hsl(var(--loss))]")}>
                <Link href={`/trades/${t.id}`} className="block">
                  {formatMoney(t.pnl)}
                </Link>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                <Link href={`/trades/${t.id}`} className="block">
                  {t.r_multiple == null ? "-" : t.r_multiple.toFixed(2)}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
