"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { ScreenshotQueue, type QueuedScreenshot } from "@/components/trades/screenshot-queue";
import { Button } from "@/components/ui/button";
import { uploadQueuedScreenshots } from "@/lib/supabase/uploads-client";

export function TradeExtraUpload({ tradeId }: { tradeId: string }) {
  const router = useRouter();
  const [queue, setQueue] = React.useState<QueuedScreenshot[]>([]);
  const [busy, setBusy] = React.useState(false);

  async function upload() {
    if (!queue.length) return;
    setBusy(true);
    try {
      await uploadQueuedScreenshots(tradeId, queue);
      setQueue([]);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const disabledUpload = busy || !queue.length;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Add screenshots</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Works with Supabase Storage bucket <span className="font-mono">trade-screenshots</span>.
          </div>
        </div>
        <Button type="button" size="sm" onClick={upload} disabled={disabledUpload}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading
            </>
          ) : (
            "Upload queued"
          )}
        </Button>
      </div>

      <ScreenshotQueue items={queue} onChange={setQueue} />
    </div>
  );
}
