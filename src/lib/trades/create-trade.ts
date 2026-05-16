import { buildTradeFromDraft } from "@/lib/trades/build-trade";
import type { CreateTradeResult, TradeDraft } from "@/lib/trades/types";
import { shouldUseMockData } from "@/lib/mock-mode";

/** Persist trade to Supabase when configured; otherwise return trade for client localStorage. */
export async function createTrade(input: TradeDraft): Promise<CreateTradeResult> {
  const trade = buildTradeFromDraft(input);

  if (shouldUseMockData()) {
    return { id: trade.id, storage: "local", trade };
  }

  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { id: trade.id, storage: "local", trade };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { id: trade.id, storage: "local", trade };
    }

    const { data, error } = await supabase
      .from("trades")
      .insert({
        user_id: user.id,
        date: trade.date,
        symbol: trade.symbol,
        direction: trade.direction,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        stop_loss: trade.stop_loss,
        risk_amount: trade.risk_amount,
        pnl: trade.pnl,
        r_multiple: trade.r_multiple,
        setup: trade.setup,
        session: trade.session,
        emotion: trade.emotion,
        confidence_score: trade.confidence_score,
        discipline_score: trade.discipline_score,
        notes: trade.notes,
        what_went_right: trade.what_went_right,
        what_went_wrong: trade.what_went_wrong,
        lesson_learned: trade.lesson_learned,
        tags: trade.tags,
        mistake_tags: trade.mistake_tags,
      })
      .select("*")
      .single();

    if (error || !data) {
      return { id: trade.id, storage: "local", trade };
    }

    return {
      id: data.id as string,
      storage: "supabase",
      trade: data as CreateTradeResult["trade"],
    };
  } catch {
    return { id: trade.id, storage: "local", trade };
  }
}
