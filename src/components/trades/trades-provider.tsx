"use client";

import * as React from "react";

import { createTradeAndReturnId } from "@/app/actions/trades";
import type { CreateTradeResult, TradeDraft } from "@/lib/trades/types";
import {
  fetchTradesClientLocal,
  fetchTradesFromBrowser,
  fetchScreenshotsFromBrowser,
} from "@/lib/trades/fetch-trades.client";
import { seedLocalTradesIfEmpty, upsertTradeLocal } from "@/lib/trades/local-store";
import { isSupabaseConfigured, shouldUseMockData } from "@/lib/mock-mode";
import type { Trade, TradeScreenshot } from "@/types/database";

interface TradesContextValue {
  trades: Trade[];
  loading: boolean;
  isLocalMode: boolean;
  refresh: () => Promise<void>;
  registerLocalTrade: (trade: Trade) => void;
  getTradeById: (id: string) => Trade | undefined;
  loadScreenshots: (tradeId: string) => Promise<TradeScreenshot[]>;
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

  const refresh = React.useCallback(async () => {
    if (isLocalMode) {
      setTrades(fetchTradesClientLocal());
      return;
    }
    setLoading(true);
    try {
      const next = await fetchTradesFromBrowser();
      setTrades(next);
    } finally {
      setLoading(false);
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

  const registerLocalTrade = React.useCallback((trade: Trade) => {
    upsertTradeLocal(trade);
    setTrades(fetchTradesClientLocal());
  }, []);

  const saveTrade = React.useCallback(
    async (draft: TradeDraft) => {
      const result = await createTradeAndReturnId(draft);
      if (result.storage === "local") {
        registerLocalTrade(result.trade);
      } else {
        const next = await fetchTradesFromBrowser();
        setTrades(next.length ? next : [result.trade, ...trades.filter((t) => t.id !== result.trade.id)]);
      }
      return result;
    },
    [registerLocalTrade, trades],
  );

  const loadScreenshots = React.useCallback(
    async (tradeId: string) => fetchScreenshotsFromBrowser(tradeId),
    [],
  );

  const value = React.useMemo<TradesContextValue>(
    () => ({
      trades,
      loading,
      isLocalMode,
      refresh,
      registerLocalTrade,
      getTradeById: (id) => trades.find((t) => t.id === id),
      loadScreenshots,
      saveTrade,
    }),
    [trades, loading, isLocalMode, refresh, registerLocalTrade, loadScreenshots, saveTrade],
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
