export type TradeDirection = "long" | "short";

export type ScreenshotType =
  | "before_entry"
  | "during_trade"
  | "after_exit"
  | "higher_timeframe";

export interface TradeScreenshot {
  id: string;
  trade_id: string;
  user_id: string;
  image_url: string;
  image_path: string;
  type: ScreenshotType;
  caption: string | null;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  date: string;
  symbol: string;
  direction: TradeDirection;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  risk_amount: number;
  pnl: number;
  r_multiple: number | null;
  setup: string | null;
  session: string | null;
  emotion: string | null;
  confidence_score: number | null;
  discipline_score: number | null;
  notes: string | null;
  what_went_right: string | null;
  what_went_wrong: string | null;
  lesson_learned: string | null;
  tags: string[];
  mistake_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DailyReview {
  id: string;
  user_id: string;
  date: string;
  discipline_score: number | null;
  emotional_rating: number | null;
  biggest_mistake: string | null;
  lesson_learned: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
