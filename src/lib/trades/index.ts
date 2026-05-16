export type { CreateTradeResult, TradeDraft, TradeStorageSource, UploadScreenshotResult } from "@/lib/trades/types";
export { createTrade } from "@/lib/trades/create-trade";
export { deriveRMultiple } from "@/lib/trades/derive-r-multiple";
export { buildTradeFromDraft } from "@/lib/trades/build-trade";
export { validateTradeForm, draftFromAutosave, draftToAutosave } from "@/lib/trades/validation";
export {
  fetchTrades,
  fetchTradesClientLocal,
  fetchTradeById,
  fetchTradeByIdClientLocal,
  fetchScreenshots,
  fetchScreenshotsClientLocal,
  fetchDailyReviews,
} from "@/lib/trades/fetch-trades";
export { uploadTradeScreenshots } from "@/lib/trades/upload-screenshots";
export {
  calculateDashboardStats,
  calculateCalendarStats,
  calculateMonthlyStats,
  calculateDayStats,
} from "@/lib/trades/analytics";
export {
  loadTradesFromLocalStorage,
  upsertTradeLocal,
  seedLocalTradesIfEmpty,
  saveTradeDraftToLocalStorage,
  loadTradeDraftFromLocalStorage,
  clearTradeDraftFromLocalStorage,
} from "@/lib/trades/local-store";
