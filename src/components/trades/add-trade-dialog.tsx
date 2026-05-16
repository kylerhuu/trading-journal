"use client";

import { AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { ScreenshotQueue, type QueuedScreenshot } from "@/components/trades/screenshot-queue";
import { useCanUploadToSupabase, useTrades } from "@/components/trades/trades-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { TradeDraft } from "@/lib/trades/types";
import { uploadTradeScreenshots } from "@/lib/trades/upload-screenshots";
import {
  clearTradeDraftFromLocalStorage,
  loadTradeDraftFromLocalStorage,
  saveTradeDraftToLocalStorage,
} from "@/lib/trades/local-store";
import { validateTradeForm } from "@/lib/trades/validation";

type SavePhase = "idle" | "saving" | "uploading" | "success" | "error";

const defaultDraft = (): Partial<TradeDraft> => ({
  date: new Date().toISOString().slice(0, 10),
  direction: "long",
});

export function AddTradeDialog() {
  const router = useRouter();
  const { saveTrade, isLocalMode } = useTrades();
  const canUploadSupabase = useCanUploadToSupabase();

  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<SavePhase>("idle");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [queue, setQueue] = React.useState<QueuedScreenshot[]>([]);
  const [failedUploads, setFailedUploads] = React.useState<
    { queueId: string; fileName: string; message: string }[]
  >([]);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [dirty, setDirty] = React.useState(false);
  const [lastSavedTradeId, setLastSavedTradeId] = React.useState<string | null>(null);

  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const saved = loadTradeDraftFromLocalStorage() as Partial<TradeDraft> | null;
    if (saved && formRef.current) {
      const form = formRef.current;
      if (saved.date) (form.elements.namedItem("date") as HTMLInputElement).value = saved.date;
      if (saved.symbol) (form.elements.namedItem("symbol") as HTMLInputElement).value = saved.symbol;
      if (saved.direction) (form.elements.namedItem("direction") as HTMLSelectElement).value = saved.direction;
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || !dirty) return;
    const id = window.setInterval(() => {
      if (!formRef.current) return;
      const fd = new FormData(formRef.current);
      const partial: Partial<TradeDraft> = {
        date: String(fd.get("date") ?? ""),
        symbol: String(fd.get("symbol") ?? ""),
        direction: String(fd.get("direction") ?? "long") as TradeDraft["direction"],
        setup: String(fd.get("setup") ?? ""),
        emotion: String(fd.get("emotion") ?? ""),
        notes: String(fd.get("notes") ?? ""),
      };
      saveTradeDraftToLocalStorage(partial);
    }, 2000);
    return () => window.clearInterval(id);
  }, [open, dirty]);

  function requestClose() {
    if (dirty && phase !== "success") {
      const ok = window.confirm("Discard unsaved changes to this trade?");
      if (!ok) return;
    }
    setOpen(false);
    setPhase("idle");
    setValidationErrors([]);
    setStatusMessage(null);
    setFailedUploads([]);
    setLastSavedTradeId(null);
    setQueue([]);
  }

  async function persistTrade(skipScreenshots: boolean) {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const validation = validateTradeForm(fd);
    if (!validation.ok || !validation.draft) {
      setValidationErrors(validation.errors);
      setPhase("error");
      setStatusMessage("Fix the highlighted fields and try again.");
      return;
    }

    setValidationErrors([]);
    setPhase("saving");
    setStatusMessage("Saving trade…");

    try {
      const result = await saveTrade(validation.draft);
      setLastSavedTradeId(result.id);
      clearTradeDraftFromLocalStorage();
      setDirty(false);

      if (skipScreenshots || queue.length === 0) {
        setPhase("success");
        setStatusMessage(
          result.storage === "local"
            ? "Trade saved locally in this browser."
            : "Trade saved.",
        );
        return;
      }

      setPhase("uploading");
      setStatusMessage("Uploading screenshots…");
      const upload = await uploadTradeScreenshots(result.id, queue, {
        forceLocal: result.storage === "local",
      });

      const remaining = queue.filter((q) => !upload.succeeded.includes(q.id));
      setQueue(remaining);
      setFailedUploads(upload.failed);

      if (upload.failed.length > 0) {
        setPhase("success");
        setStatusMessage(
          `Trade saved. ${upload.failed.length} screenshot(s) failed — retry below or from the trade page.`,
        );
      } else {
        setPhase("success");
        setStatusMessage("Trade and screenshots saved.");
        setQueue([]);
      }
    } catch (err) {
      console.error(err);
      setPhase("error");
      setStatusMessage(err instanceof Error ? err.message : "Could not save trade. Your draft is still in the form.");
    }
  }

  async function retryFailedUploads() {
    if (!lastSavedTradeId || failedUploads.length === 0) return;
    const retryQueue = queue.filter((q) => failedUploads.some((f) => f.queueId === q.id));
    if (!retryQueue.length) return;

    setPhase("uploading");
    setStatusMessage("Retrying failed uploads…");
    try {
      const upload = await uploadTradeScreenshots(lastSavedTradeId, retryQueue, {
        forceLocal: isLocalMode,
      });
      setFailedUploads(upload.failed);
      setQueue(queue.filter((q) => !upload.succeeded.includes(q.id)));
      if (upload.failed.length === 0) {
        setStatusMessage("All screenshots uploaded.");
      } else {
        setStatusMessage(`${upload.failed.length} screenshot(s) still failed.`);
      }
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setPhase("success");
    }
  }

  function goToTrade() {
    if (!lastSavedTradeId) return;
    setOpen(false);
    router.push(`/trades/${lastSavedTradeId}`);
    router.refresh();
  }

  const busy = phase === "saving" || phase === "uploading";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 rounded-full px-4">
          <Plus className="h-4 w-4" />
          Add trade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log trade</DialogTitle>
          <DialogDescription>Fast capture first. Your draft autosaves while this dialog is open.</DialogDescription>
        </DialogHeader>

        {statusMessage ? (
          <div
            className={cn(
              "flex gap-2 rounded-lg border px-3 py-2 text-sm",
              phase === "error"
                ? "border-[hsl(var(--loss)/0.4)] bg-[hsl(var(--loss)/0.08)] text-foreground"
                : phase === "success"
                  ? "border-[hsl(var(--profit)/0.35)] bg-[hsl(var(--profit)/0.08)]"
                  : "border-border bg-muted/20 text-muted-foreground",
            )}
          >
            {phase === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--profit))]" />
            ) : phase === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--loss))]" />
            ) : (
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
            )}
            <span>{statusMessage}</span>
          </div>
        ) : null}

        {validationErrors.length > 0 ? (
          <ul className="list-inside list-disc text-sm text-[hsl(var(--loss))]">
            {validationErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}

        {failedUploads.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/15 p-3 text-xs">
            <div className="font-medium text-foreground">Failed uploads</div>
            <ul className="list-inside list-disc text-muted-foreground">
              {failedUploads.map((f) => (
                <li key={f.queueId}>
                  {f.fileName}: {f.message}
                </li>
              ))}
            </ul>
            {lastSavedTradeId ? (
              <Button type="button" size="sm" variant="outline" onClick={retryFailedUploads} disabled={busy}>
                Retry failed uploads
              </Button>
            ) : null}
          </div>
        ) : null}

        <form
          ref={formRef}
          className="space-y-5"
          onChange={() => setDirty(true)}
          onSubmit={(e) => {
            e.preventDefault();
            void persistTrade(false);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" required defaultValue={defaultDraft().date} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input id="symbol" name="symbol" placeholder="ES, NQ, AAPL…" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction *</Label>
              <select
                id="direction"
                name="direction"
                defaultValue="long"
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup">Setup</Label>
              <Input id="setup" name="setup" placeholder="London trend, VWAP fade…" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entry_price">Entry *</Label>
              <Input id="entry_price" name="entry_price" inputMode="decimal" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit_price">Exit *</Label>
              <Input id="exit_price" name="exit_price" inputMode="decimal" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stop_loss">Stop loss *</Label>
              <Input id="stop_loss" name="stop_loss" inputMode="decimal" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk_amount">Risk ($) *</Label>
              <Input id="risk_amount" name="risk_amount" inputMode="decimal" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pnl">P/L ($) *</Label>
              <Input id="pnl" name="pnl" inputMode="decimal" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emotion">Emotion</Label>
              <Input id="emotion" name="emotion" placeholder="calm, rushed…" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="What mattered on execution?" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" placeholder="comma separated" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mistake_tags">Mistake tags</Label>
              <Input id="mistake_tags" name="mistake_tags" placeholder="early entry, sized up…" />
            </div>
          </div>

          <ScreenshotQueue items={queue} onChange={setQueue} />
          {!canUploadSupabase && queue.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Demo mode: screenshots save in this browser only (not Supabase Storage).
            </p>
          ) : null}

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between px-3">
                Advanced fields
                <span className="text-xs text-muted-foreground">{advancedOpen ? "Hide" : "Show"}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session">Session</Label>
                  <Input id="session" name="session" placeholder="London, NY…" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence_score">Confidence (1–10)</Label>
                  <Input id="confidence_score" name="confidence_score" inputMode="numeric" min={1} max={10} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discipline_score">Discipline (1–10)</Label>
                <Input id="discipline_score" name="discipline_score" inputMode="numeric" min={1} max={10} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="what_went_right">What went right</Label>
                <Textarea id="what_went_right" name="what_went_right" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="what_went_wrong">What went wrong</Label>
                <Textarea id="what_went_wrong" name="what_went_wrong" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson_learned">Lesson learned</Label>
                <Textarea id="lesson_learned" name="lesson_learned" />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            {phase === "success" && lastSavedTradeId ? (
              <Button type="button" onClick={goToTrade}>
                View trade
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>
              {phase === "success" ? "Close" : "Cancel"}
            </Button>
            {phase !== "success" ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void persistTrade(true)}
                >
                  Save without screenshots
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {phase === "uploading" ? "Uploading…" : "Saving…"}
                    </>
                  ) : (
                    "Save trade"
                  )}
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
