"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useTrades } from "@/components/trades/trades-provider";

/** Refetch trades from Supabase when the user signs in or out. */
export function TradesAuthSync() {
  const { authConfigured, authReady, user } = useAuth();
  const { refresh, isLocalMode } = useTrades();

  React.useEffect(() => {
    if (!authConfigured || !authReady || isLocalMode) return;
    void refresh();
  }, [authConfigured, authReady, isLocalMode, user?.id, refresh]);

  return null;
}
