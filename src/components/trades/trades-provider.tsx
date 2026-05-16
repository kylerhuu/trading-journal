"use client";

import * as React from "react";

import { createTradeAndReturnId } from "@/app/actions/trades";
import type { CreateTradeResult, TradeDraft } from "@/lib/trades/types";
import {
  fetchTradesClientLocal,
  fetchScreenshotsClientLocal,
} from "@/lib/trades/fetch-trades";
import { seedLocalTradesIfEmpty, upsertTradeLocal } from "@/lib/trades/local-store";
import { isSupabaseConfigured, shouldUseMockData } from "@/lib/mock-mode";
import type { Trade, TradeScreenshot } from "@/types/database";

interface TradesContextValue {
  trades: Trade[];
  loading: boolean;
  isLocalMode: boolean;
  refresh: () => void;
  registerLocalTrade: (trade: Trade) => void;
  getTradeById: (id: string) => Trade | undefined;
  getScreenshots: (tradeId: string) => TradeScreenshot[];
  saveTrade: (draft: TradeDraft) => Promise<CreateTradeResult>;
}

const TradesContext = React.createContext<TradesContextValue | null>(null);

export function TradesProvider({
  initialTrades,
  children,
}: {
  initialTrades: Trade[];
  children: React.ReactNode;
}) {
  const isLocalMode = shouldUseMockData();
  const [trades, setTrades] = React.useState<Trade[]>(initialTrades);
  const [loading, setLoading] = React.useState(isLocalMode);

  const refresh = React.useCallback(() => {
    if (isLocalMode) {
      setTrades(fetchTradesClientLocal());
    }
  }, [isLocalMode]);

  React.useEffect(() => {
    if (!isLocalMode) {
      setTrades(initialTrades);
      setLoading(false);
      return;
    }
    seedLocalTradesIfEmpty();
    setTrades(fetchTradesClientLocal());
    setLoading(false);
  }, [initialTrades, isLocalMode]);

  const registerLocalTrade = React.useCallback(
    (trade: Trade) => {
      upsertTradeLocal(trade);
      setTrades(fetchTradesClientLocal());
    },
    [],
  );

  const saveTrade = React.useCallback(
    async (draft: TradeDraft) => {
      const result = await createTradeAndReturnId(draft);
      if (result.storage === "local") {
        registerLocalTrade(result.trade);
      } else {
        setTrades((prev) => [result.trade, ...prev.filter((t) => t.id !== result.trade.id)]);
      }
      return result;
    },
    [registerLocalTrade, refresh],
  );

  const value = React.useMemo<TradesContextValue>(
    () => ({
      trades,
      loading,
      isLocalMode,
      refresh,
      registerLocalTrade,
      getTradeById: (id) => trades.find((t) => t.id === id),
      getScreenshots: (tradeId) => fetchScreenshotsClientLocal(tradeId),
      saveTrade,
    }),
    [trades, loading, isLocalMode, refresh, registerLocalTrade, saveTrade],
  );

  return <TradesContext.Provider value={value}>{children}</TradesContext.Provider>;
}

export function useTrades() {
  const ctx = React.useContext(TradesContext);
  if (!ctx) throw new Error("useTrades must be used within TradesProvider");
  return ctx;
}

export function useTradesOptional() {
  return React.useContext(TradesContext);
}

/** Client-only: whether screenshots can upload to Supabase Storage. */
export function useCanUploadToSupabase() {
  return isSupabaseConfigured();
}
