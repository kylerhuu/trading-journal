import { getScreenshotsForTrade, mockDailyReviews, mockTrades } from "@/lib/mock-data";
import { shouldUseMockData } from "@/lib/mock-mode";
import type { DailyReview, Trade, TradeScreenshot } from "@/types/database";

export async function fetchTrades(): Promise<Trade[]> {
  if (shouldUseMockData()) return mockTrades;

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockTrades;

  const { data, error } = await supabase.from("trades").select("*").order("date", { ascending: false });
  if (error || !data) return mockTrades;
  return data as Trade[];
}

export async function fetchTradeById(id: string): Promise<Trade | null> {
  if (shouldUseMockData()) return mockTrades.find((t) => t.id === id) ?? null;

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockTrades.find((t) => t.id === id) ?? null;

  const { data, error } = await supabase.from("trades").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Trade;
}

export async function fetchScreenshots(tradeId: string): Promise<TradeScreenshot[]> {
  if (shouldUseMockData()) return getScreenshotsForTrade(tradeId);

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return getScreenshotsForTrade(tradeId);

  const { data, error } = await supabase
    .from("trade_screenshots")
    .select("*")
    .eq("trade_id", tradeId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as TradeScreenshot[];
}

export async function fetchDailyReviews(): Promise<DailyReview[]> {
  if (shouldUseMockData()) return mockDailyReviews;

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockDailyReviews;

  const { data, error } = await supabase.from("daily_reviews").select("*").order("date", { ascending: false });
  if (error || !data) return mockDailyReviews;
  return data as DailyReview[];
}
