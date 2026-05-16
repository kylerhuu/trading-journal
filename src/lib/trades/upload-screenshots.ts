"use client";

import type { QueuedScreenshot } from "@/components/trades/screenshot-queue";
import { addScreenshotsLocal } from "@/lib/trades/local-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/mock-mode";
import type { UploadScreenshotResult } from "@/lib/trades/types";
import type { TradeScreenshot } from "@/types/database";

const LOCAL_USER_ID = "local-user-id";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

async function uploadScreenshotsLocal(
  tradeId: string,
  queue: QueuedScreenshot[],
): Promise<UploadScreenshotResult> {
  const succeeded: string[] = [];
  const failed: UploadScreenshotResult["failed"] = [];

  const rows: TradeScreenshot[] = [];

  for (const item of queue) {
    try {
      const image_url = await fileToDataUrl(item.file);
      rows.push({
        id: item.id,
        trade_id: tradeId,
        user_id: LOCAL_USER_ID,
        image_url,
        image_path: `local/${tradeId}/${item.id}-${item.file.name}`,
        type: item.type,
        caption: item.caption || null,
        created_at: new Date().toISOString(),
      });
      succeeded.push(item.id);
    } catch (err) {
      failed.push({
        queueId: item.id,
        fileName: item.file.name,
        message: err instanceof Error ? err.message : "Read failed",
      });
    }
  }

  if (rows.length) addScreenshotsLocal(rows);

  return { succeeded, failed };
}

async function uploadScreenshotsSupabase(
  tradeId: string,
  queue: QueuedScreenshot[],
): Promise<UploadScreenshotResult> {
  const succeeded: string[] = [];
  const failed: UploadScreenshotResult["failed"] = [];

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return {
      succeeded: [],
      failed: queue.map((q) => ({
        queueId: q.id,
        fileName: q.file.name,
        message: "Supabase is not configured",
      })),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      succeeded: [],
      failed: queue.map((q) => ({
        queueId: q.id,
        fileName: q.file.name,
        message: "Sign in to upload screenshots",
      })),
    };
  }

  for (const item of queue) {
    try {
      const path = `${user.id}/${tradeId}/${item.id}-${item.file.name}`;
      const { error: uploadError } = await supabase.storage.from("trade-screenshots").upload(path, item.file, {
        upsert: true,
        contentType: item.file.type || "image/png",
      });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from("trade-screenshots").getPublicUrl(path);

      const { error: insertError } = await supabase.from("trade_screenshots").insert({
        trade_id: tradeId,
        user_id: user.id,
        image_url: pub.publicUrl,
        image_path: path,
        type: item.type,
        caption: item.caption ? item.caption : null,
      });
      if (insertError) throw insertError;

      succeeded.push(item.id);
    } catch (err) {
      failed.push({
        queueId: item.id,
        fileName: item.file.name,
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  }

  return { succeeded, failed };
}

/** Upload trade screenshots to Supabase Storage or localStorage (demo mode). */
export async function uploadTradeScreenshots(
  tradeId: string,
  queue: QueuedScreenshot[],
  options?: { forceLocal?: boolean },
): Promise<UploadScreenshotResult> {
  if (!queue.length) return { succeeded: [], failed: [] };

  const useLocal = options?.forceLocal || !isSupabaseConfigured();
  if (useLocal) return uploadScreenshotsLocal(tradeId, queue);
  return uploadScreenshotsSupabase(tradeId, queue);
}
