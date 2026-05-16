"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { ScreenshotQueue, type QueuedScreenshot } from "@/components/trades/screenshot-queue";
import { useCanUploadToSupabase, useTrades } from "@/components/trades/trades-provider";
import { Button } from "@/components/ui/button";
import { uploadTradeScreenshots } from "@/lib/trades/upload-screenshots";

export function TradeExtraUpload({
  tradeId,
  onUploaded,
}: {
  tradeId: string;
  onUploaded?: () => void;
}) {
  const router = useRouter();
  const { isLocalMode } = useTrades();
  const canUploadSupabase = useCanUploadToSupabase();

  const [queue, setQueue] = React.useState<QueuedScreenshot[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState<{ queueId: string; fileName: string; message: string }[]>([]);
  const [message, setMessage] = React.useState<string | null>(null);

  async function upload(skipIfEmpty = false) {
    if (skipIfEmpty && !queue.length) return;
    if (!queue.length) return;

    setBusy(true);
    setMessage(null);
    try {
      const result = await uploadTradeScreenshots(tradeId, queue, { forceLocal: isLocalMode });
      setFailed(result.failed);
      setQueue(queue.filter((q) => !result.succeeded.includes(q.id)));

      if (result.failed.length === 0) {
        setMessage("Screenshots uploaded.");
        onUploaded?.();
        router.refresh();
      } else {
        setMessage(`${result.succeeded.length} uploaded, ${result.failed.length} failed. Retry below.`);
      }
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Upload failed");
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
            Bucket: <span className="font-mono">trade-screenshots</span>
            {isLocalMode
              ? " — saved in this browser (demo mode)."
              : canUploadSupabase
                ? " — requires Supabase sign-in."
                : " — configure Supabase env vars to enable."}
          </div>
        </div>
        <Button type="button" size="sm" onClick={() => void upload()} disabled={disabledUpload}>
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

      {message ? (
        <div className="flex gap-2 rounded-lg border border-border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
          {failed.length > 0 ? <AlertCircle className="h-4 w-4 shrink-0 text-[hsl(var(--loss))]" /> : null}
          {message}
        </div>
      ) : null}

      {failed.length > 0 ? (
        <ul className="list-inside list-disc text-xs text-[hsl(var(--loss))]">
          {failed.map((f) => (
            <li key={f.queueId}>
              {f.fileName}: {f.message}
            </li>
          ))}
        </ul>
      ) : null}

      <ScreenshotQueue items={queue} onChange={setQueue} />
    </div>
  );
}
