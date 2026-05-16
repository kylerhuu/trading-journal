import "server-only";

import { mockDailyReviews, getScreenshotsForTrade } from "@/lib/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { shouldUseMockData } from "@/lib/mock-mode";
import type { DailyReview, Trade, TradeScreenshot } from "@/types/database";

/** Server: Supabase trades, or empty (client hydrates localStorage in demo mode). */
export async function fetchTrades(): Promise<Trade[]> {
  if (shouldUseMockData()) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase.from("trades").select("*").order("date", { ascending: false });
    if (error || !data) return [];
    return data as Trade[];
  } catch {
    return [];
  }
}

export async function fetchTradeById(id: string): Promise<Trade | null> {
  if (shouldUseMockData()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase.from("trades").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return data as Trade;
  } catch {
    return null;
  }
}

export async function fetchScreenshots(tradeId: string): Promise<TradeScreenshot[]> {
  if (shouldUseMockData()) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return getScreenshotsForTrade(tradeId);

    const { data, error } = await supabase
      .from("trade_screenshots")
      .select("*")
      .eq("trade_id", tradeId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data as TradeScreenshot[];
  } catch {
    return getScreenshotsForTrade(tradeId);
  }
}

export async function fetchDailyReviews(): Promise<DailyReview[]> {
  if (shouldUseMockData()) return mockDailyReviews;

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return mockDailyReviews;

    const { data, error } = await supabase.from("daily_reviews").select("*").order("date", { ascending: false });
    if (error || !data) return mockDailyReviews;
    return data as DailyReview[];
  } catch {
    return mockDailyReviews;
  }
}
