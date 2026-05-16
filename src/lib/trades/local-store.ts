/** Client-only localStorage persistence for trades and screenshots. */

import { mockTrades } from "@/lib/mock-data";
import type { Trade, TradeScreenshot } from "@/types/database";

const TRADES_KEY = "tj-trades-v1";
const SCREENSHOTS_KEY = "tj-screenshots-v1";
const DRAFT_KEY = "tj-trade-draft-v1";
const SEEDED_KEY = "tj-trades-seeded-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadTradesFromLocalStorage(): Trade[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(TRADES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Trade[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTradesToLocalStorage(trades: Trade[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function upsertTradeLocal(trade: Trade): void {
  const trades = loadTradesFromLocalStorage();
  const idx = trades.findIndex((t) => t.id === trade.id);
  if (idx >= 0) trades[idx] = trade;
  else trades.unshift(trade);
  saveTradesToLocalStorage(trades);
}

export function seedLocalTradesIfEmpty(): Trade[] {
  if (!isBrowser()) return [];
  const existing = loadTradesFromLocalStorage();
  if (existing.length > 0) return existing;

  const seeded = window.localStorage.getItem(SEEDED_KEY);
  if (!seeded) {
    const copy = mockTrades.map((t) => ({ ...t, id: t.id }));
    saveTradesToLocalStorage(copy);
    window.localStorage.setItem(SEEDED_KEY, "1");
    return copy;
  }

  return existing;
}

export function loadScreenshotsFromLocalStorage(): TradeScreenshot[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(SCREENSHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TradeScreenshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScreenshotsToLocalStorage(shots: TradeScreenshot[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SCREENSHOTS_KEY, JSON.stringify(shots));
}

export function getScreenshotsForTradeLocal(tradeId: string): TradeScreenshot[] {
  return loadScreenshotsFromLocalStorage()
    .filter((s) => s.trade_id === tradeId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function addScreenshotsLocal(rows: TradeScreenshot[]): void {
  const all = loadScreenshotsFromLocalStorage();
  all.push(...rows);
  saveScreenshotsToLocalStorage(all);
}

export function saveTradeDraftToLocalStorage(draft: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // quota exceeded — ignore
  }
}

export function loadTradeDraftFromLocalStorage(): unknown | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearTradeDraftFromLocalStorage(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(DRAFT_KEY);
}
