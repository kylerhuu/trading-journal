import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  getISOWeek,
  getISOWeekYear,
  startOfMonth,
} from "date-fns";

import type { Trade } from "@/types/database";

export interface DashboardSummary {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  avgR: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  bestSetup: string | null;
  worstSetup: string | null;
}

export interface MonthlyPnLPoint {
  month: string;
  pnl: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
}

export interface WeekdayPerf {
  weekday: string;
  pnl: number;
  trades: number;
}

export interface MistakeCount {
  tag: string;
  count: number;
}

export function computeDashboard(trades: Trade[]): DashboardSummary {
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  const rVals = trades.map((t) => t.r_multiple).filter((r): r is number => r != null);
  const avgR = rVals.length ? rVals.reduce((a, b) => a + b, 0) / rVals.length : 0;

  const setupPnL = new Map<string, { pnl: number; count: number }>();
  for (const t of trades) {
    const key = (t.setup ?? "Unlabeled").trim() || "Unlabeled";
    const cur = setupPnL.get(key) ?? { pnl: 0, count: 0 };
    cur.pnl += t.pnl;
    cur.count += 1;
    setupPnL.set(key, cur);
  }

  let bestSetup: string | null = null;
  let worstSetup: string | null = null;
  let bestVal = -Infinity;
  let worstVal = Infinity;
  for (const [setup, v] of setupPnL) {
    if (v.count === 0) continue;
    if (v.pnl > bestVal) {
      bestVal = v.pnl;
      bestSetup = setup;
    }
    if (v.pnl < worstVal) {
      worstVal = v.pnl;
      worstSetup = setup;
    }
  }

  return {
    totalTrades: trades.length,
    winRate: trades.length ? wins.length / trades.length : 0,
    totalPnL,
    avgR,
    avgWin: wins.length ? grossWin / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    profitFactor: grossLoss === 0 ? grossWin : grossWin / grossLoss,
    bestSetup,
    worstSetup,
  };
}

export function monthlyPnLSeries(trades: Trade[]): MonthlyPnLPoint[] {
  const map = new Map<string, number>();
  for (const t of trades) {
    const key = format(new Date(`${t.date}T12:00:00`), "yyyy-MM");
    map.set(key, (map.get(key) ?? 0) + t.pnl);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, pnl]) => ({ month, pnl }));
}

export function equityCurve(trades: Trade[]): EquityPoint[] {
  const byDate = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0;
  return byDate.map((t) => {
    cum += t.pnl;
    return { date: t.date, equity: cum };
  });
}

const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekdayPerformance(trades: Trade[]): WeekdayPerf[] {
  const buckets = WEEK_LABELS.map((weekday) => ({ weekday, pnl: 0, trades: 0 }));
  for (const t of trades) {
    const d = new Date(`${t.date}T12:00:00`);
    const idx = getDay(d);
    buckets[idx].pnl += t.pnl;
    buckets[idx].trades += 1;
  }
  const order = [1, 2, 3, 4, 5, 0, 6];
  return order.map((i) => buckets[i]);
}

export function topMistakes(trades: Trade[], limit = 6): MistakeCount[] {
  const counts = new Map<string, number>();
  for (const t of trades) {
    for (const m of t.mistake_tags) {
      const key = m.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface DayAgg {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export function tradesByDay(trades: Trade[]): Map<string, DayAgg> {
  const map = new Map<string, DayAgg>();
  for (const t of trades) {
    const cur =
      map.get(t.date) ??
      ({
        date: t.date,
        pnl: 0,
        trades: 0,
        wins: 0,
        losses: 0,
      } satisfies DayAgg);
    cur.pnl += t.pnl;
    cur.trades += 1;
    if (t.pnl > 0) cur.wins += 1;
    else if (t.pnl < 0) cur.losses += 1;
    map.set(t.date, cur);
  }
  return map;
}

export function monthCalendarDays(month: Date, trades: Trade[]) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const cells = eachDayOfInterval({ start, end });
  const byDay = tradesByDay(trades);
  return cells.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const agg = byDay.get(key);
    return { date: d, key, agg };
  });
}

export interface MonthlyReviewMetrics {
  monthKey: string;
  monthlyPnL: number;
  weeklyBreakdown: { weekLabel: string; pnl: number }[];
  heatmap: { date: string; pnl: number; intensity: number }[];
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  bestSetup: string | null;
  worstSetup: string | null;
  mostCommonMistake: string | null;
  avgDailyPnL: number;
}

export function computeMonthlyReview(month: Date, trades: Trade[]): MonthlyReviewMetrics {
  const monthKey = format(month, "yyyy-MM");
  const monthTrades = trades.filter((t) => t.date.startsWith(monthKey));
  const monthlyPnL = monthTrades.reduce((s, t) => s + t.pnl, 0);

  const byWeek = new Map<string, number>();
  for (const t of monthTrades) {
    const d = new Date(`${t.date}T12:00:00`);
    const w = `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
    byWeek.set(w, (byWeek.get(w) ?? 0) + t.pnl);
  }
  const weeklyBreakdown = [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekLabel, pnl]) => ({ weekLabel, pnl }));

  const byDay = tradesByDay(monthTrades);
  let bestDay: { date: string; pnl: number } | null = null;
  let worstDay: { date: string; pnl: number } | null = null;
  let maxAbs = 1;
  for (const [date, agg] of byDay) {
    if (!bestDay || agg.pnl > bestDay.pnl) bestDay = { date, pnl: agg.pnl };
    if (!worstDay || agg.pnl < worstDay.pnl) worstDay = { date, pnl: agg.pnl };
    maxAbs = Math.max(maxAbs, Math.abs(agg.pnl));
  }
  const heatmap: MonthlyReviewMetrics["heatmap"] = [...byDay.entries()].map(([date, agg]) => ({
    date,
    pnl: agg.pnl,
    intensity: Math.abs(agg.pnl) / maxAbs,
  }));

  const dash = computeDashboard(monthTrades);

  const mistakes = topMistakes(monthTrades, 1);
  const tradingDays = new Set(monthTrades.map((t) => t.date)).size;

  return {
    monthKey,
    monthlyPnL,
    weeklyBreakdown,
    heatmap,
    bestDay,
    worstDay,
    bestSetup: dash.bestSetup,
    worstSetup: dash.worstSetup,
    mostCommonMistake: mistakes[0]?.tag ?? null,
    avgDailyPnL: tradingDays ? monthlyPnL / tradingDays : 0,
  };
}

export interface DailyReviewDerived {
  totalPnL: number;
  trades: number;
  winRate: number;
  biggestWin: number;
  biggestLoss: number;
}

export function computeDayStats(tradesOnDay: Trade[]): DailyReviewDerived {
  const wins = tradesOnDay.filter((t) => t.pnl > 0);
  const losses = tradesOnDay.filter((t) => t.pnl < 0);
  const biggestWin = wins.length ? Math.max(...wins.map((t) => t.pnl)) : 0;
  const biggestLoss = losses.length ? Math.min(...losses.map((t) => t.pnl)) : 0;
  return {
    totalPnL: tradesOnDay.reduce((s, t) => s + t.pnl, 0),
    trades: tradesOnDay.length,
    winRate: tradesOnDay.length ? wins.length / tradesOnDay.length : 0,
    biggestWin,
    biggestLoss,
  };
}
