import { getScreenshotsForTrade } from "@/lib/mock-data";
import {
  getScreenshotsForTradeLocal,
  loadTradesFromLocalStorage,
  seedLocalTradesIfEmpty,
} from "@/lib/trades/local-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, shouldUseMockData } from "@/lib/mock-mode";
import type { Trade, TradeScreenshot } from "@/types/database";

/** Client: full trade list for local persistence / demo mode. */
export function fetchTradesClientLocal(): Trade[] {
  const seeded = seedLocalTradesIfEmpty();
  return seeded.length ? seeded : loadTradesFromLocalStorage();
}

export function fetchTradeByIdClientLocal(id: string): Trade | null {
  return fetchTradesClientLocal().find((t) => t.id === id) ?? null;
}

/** Client: screenshots from localStorage or mock seed. */
export function fetchScreenshotsClientLocal(tradeId: string): TradeScreenshot[] {
  const local = getScreenshotsForTradeLocal(tradeId);
  if (local.length) return local;
  return getScreenshotsForTrade(tradeId);
}

/** Client: load trades from Supabase (browser session). Falls back to local list if unavailable. */
export async function fetchTradesFromBrowser(): Promise<Trade[]> {
  if (shouldUseMockData() || !isSupabaseConfigured()) {
    return fetchTradesClientLocal();
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return fetchTradesClientLocal();

  try {
    const { data, error } = await supabase.from("trades").select("*").order("date", { ascending: false });
    if (error || !data) return [];
    return data as Trade[];
  } catch {
    return [];
  }
}

/** Client: load one trade from Supabase. */
export async function fetchTradeByIdFromBrowser(id: string): Promise<Trade | null> {
  if (shouldUseMockData() || !isSupabaseConfigured()) {
    return fetchTradeByIdClientLocal(id);
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return fetchTradeByIdClientLocal(id);

  try {
    const { data, error } = await supabase.from("trades").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return data as Trade;
  } catch {
    return fetchTradeByIdClientLocal(id);
  }
}

/** Client: load screenshots from Supabase or local fallback. */
export async function fetchScreenshotsFromBrowser(tradeId: string): Promise<TradeScreenshot[]> {
  if (shouldUseMockData() || !isSupabaseConfigured()) {
    return fetchScreenshotsClientLocal(tradeId);
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) return fetchScreenshotsClientLocal(tradeId);

  try {
    const { data, error } = await supabase
      .from("trade_screenshots")
      .select("*")
      .eq("trade_id", tradeId)
      .order("created_at", { ascending: true });
    if (error || !data) return fetchScreenshotsClientLocal(tradeId);
    return data as TradeScreenshot[];
  } catch {
    return fetchScreenshotsClientLocal(tradeId);
  }
}
