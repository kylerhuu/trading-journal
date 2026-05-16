import { getScreenshotsForTrade, mockDailyReviews, mockTrades } from "@/lib/mock-data";
import type { DailyReview, Trade, TradeScreenshot } from "@/types/database";

function useMock(): boolean {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "" ||
    process.env.TRADING_JOURNAL_USE_MOCK === "true"
  );
}

export async function fetchTrades(): Promise<Trade[]> {
  if (useMock()) return mockTrades;

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockTrades;

  const { data, error } = await supabase.from("trades").select("*").order("date", { ascending: false });
  if (error || !data) return mockTrades;
  return data as Trade[];
}

export async function fetchTradeById(id: string): Promise<Trade | null> {
  if (useMock()) return mockTrades.find((t) => t.id === id) ?? null;

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockTrades.find((t) => t.id === id) ?? null;

  const { data, error } = await supabase.from("trades").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as Trade;
}

export async function fetchScreenshots(tradeId: string): Promise<TradeScreenshot[]> {
  if (useMock()) return getScreenshotsForTrade(tradeId);

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
  if (useMock()) return mockDailyReviews;

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockDailyReviews;

  const { data, error } = await supabase.from("daily_reviews").select("*").order("date", { ascending: false });
  if (error || !data) return mockDailyReviews;
  return data as DailyReview[];
}
