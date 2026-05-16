import { deriveRMultiple } from "@/lib/trades/derive-r-multiple";
import type { TradeDraft } from "@/lib/trades/types";
import type { Trade } from "@/types/database";

const LOCAL_USER_ID = "local-user-id";

export function buildTradeFromDraft(input: TradeDraft, id?: string): Trade {
  const now = new Date().toISOString();
  return {
    id: id ?? crypto.randomUUID(),
    user_id: LOCAL_USER_ID,
    date: input.date,
    symbol: input.symbol.trim().toUpperCase(),
    direction: input.direction,
    entry_price: input.entry_price,
    exit_price: input.exit_price,
    stop_loss: input.stop_loss,
    risk_amount: input.risk_amount,
    pnl: input.pnl,
    r_multiple: deriveRMultiple(input.pnl, input.risk_amount),
    setup: input.setup ?? null,
    session: input.session ?? null,
    emotion: input.emotion ?? null,
    confidence_score: input.confidence_score ?? null,
    discipline_score: input.discipline_score ?? null,
    notes: input.notes ?? null,
    what_went_right: input.what_went_right ?? null,
    what_went_wrong: input.what_went_wrong ?? null,
    lesson_learned: input.lesson_learned ?? null,
    tags: input.tags ?? [],
    mistake_tags: input.mistake_tags ?? [],
    created_at: now,
    updated_at: now,
  };
}
