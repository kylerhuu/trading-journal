import type { Trade, TradeDirection } from "@/types/database";

export interface TradeDraft {
  date: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  risk_amount: number;
  pnl: number;
  setup?: string | null;
  session?: string | null;
  emotion?: string | null;
  confidence_score?: number | null;
  discipline_score?: number | null;
  notes?: string | null;
  what_went_right?: string | null;
  what_went_wrong?: string | null;
  lesson_learned?: string | null;
  tags?: string[];
  mistake_tags?: string[];
}

export type TradeStorageSource = "supabase" | "local";

export interface CreateTradeResult {
  id: string;
  storage: TradeStorageSource;
  trade: Trade;
}

export interface UploadScreenshotResult {
  succeeded: string[];
  failed: { queueId: string; fileName: string; message: string }[];
}
