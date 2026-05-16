"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createTrade } from "@/lib/trades/create-trade";
import type { CreateTradeResult, TradeDraft } from "@/lib/trades/types";

export type { TradeDraft, CreateTradeResult };

export async function createTradeAndReturnId(input: TradeDraft): Promise<CreateTradeResult> {
  const result = await createTrade(input);
  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath("/trades");
  revalidatePath("/daily-review");
  revalidatePath("/monthly-review");
  revalidatePath(`/trades/${result.id}`);
  return result;
}

export async function createTradeAction(input: TradeDraft) {
  const { id } = await createTradeAndReturnId(input);
  redirect(`/trades/${id}`);
}
