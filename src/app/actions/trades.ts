"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { mockTrades } from "@/lib/mock-data";
import { shouldUseMockData } from "@/lib/mock-mode";
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

function deriveRMultiple(trade: Pick<TradeDraft, "pnl" | "risk_amount">): number | null {
  if (!trade.risk_amount) return null;
  return trade.pnl / trade.risk_amount;
}

async function persistTrade(input: TradeDraft): Promise<{ id: string }> {
  const r_multiple = deriveRMultiple(input);

  if (shouldUseMockData()) {
    const row: Trade = {
      id: crypto.randomUUID(),
      user_id: "mock-user-id",
      date: input.date,
      symbol: input.symbol.trim().toUpperCase(),
      direction: input.direction,
      entry_price: input.entry_price,
      exit_price: input.exit_price,
      stop_loss: input.stop_loss,
      risk_amount: input.risk_amount,
      pnl: input.pnl,
      r_multiple,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTrades.unshift(row);
    return { id: row.id };
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: user.id,
      date: input.date,
      symbol: input.symbol.trim().toUpperCase(),
      direction: input.direction,
      entry_price: input.entry_price,
      exit_price: input.exit_price,
      stop_loss: input.stop_loss,
      risk_amount: input.risk_amount,
      pnl: input.pnl,
      r_multiple,
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
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create trade");
  }

  return { id: data.id as string };
}

export async function createTradeAndReturnId(input: TradeDraft): Promise<{ id: string }> {
  const id = await persistTrade(input);
  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath("/trades");
  return id;
}

export async function createTradeAction(input: TradeDraft) {
  const { id } = await persistTrade(input);
  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath("/trades");
  redirect(`/trades/${id}`);
}
