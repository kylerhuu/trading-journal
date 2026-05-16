export type { CreateTradeResult, TradeDraft, TradeStorageSource, UploadScreenshotResult } from "@/lib/trades/types";
export { deriveRMultiple } from "@/lib/trades/derive-r-multiple";
export { buildTradeFromDraft } from "@/lib/trades/build-trade";
export { validateTradeForm, draftFromAutosave, draftToAutosave } from "@/lib/trades/validation";
export {
  fetchTradesClientLocal,
  fetchTradeByIdClientLocal,
  fetchScreenshotsClientLocal,
  fetchTradesFromBrowser,
  fetchTradeByIdFromBrowser,
  fetchScreenshotsFromBrowser,
} from "@/lib/trades/fetch-trades.client";
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
