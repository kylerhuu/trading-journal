"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import type { QueuedScreenshot } from "@/components/trades/screenshot-queue";

export async function uploadQueuedScreenshots(tradeId: string, queue: QueuedScreenshot[]) {
  if (!queue.length) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return;

  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sign in to upload screenshots.");
  }

  for (const item of queue) {
    const path = `${user.id}/${tradeId}/${item.id}-${item.file.name}`;
    const { error: uploadError } = await supabase.storage.from("trade-screenshots").upload(path, item.file, {
      upsert: true,
      contentType: item.file.type,
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
  }
}
