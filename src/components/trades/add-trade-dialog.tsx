"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { createTradeAndReturnId } from "@/app/actions/trades";

import { ScreenshotQueue, type QueuedScreenshot } from "@/components/trades/screenshot-queue";
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
import { uploadQueuedScreenshots } from "@/lib/supabase/uploads-client";

export function AddTradeDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [queue, setQueue] = React.useState<QueuedScreenshot[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const parseNum = (key: string) => Number(String(fd.get(key) ?? "").replace(/,/g, ""));
    const parseTags = (raw: string) =>
      raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const draft = {
      date: String(fd.get("date") ?? ""),
      symbol: String(fd.get("symbol") ?? ""),
      direction: String(fd.get("direction") ?? "long") as "long" | "short",
      entry_price: parseNum("entry_price"),
      exit_price: parseNum("exit_price"),
      stop_loss: parseNum("stop_loss"),
      risk_amount: parseNum("risk_amount"),
      pnl: parseNum("pnl"),
      setup: String(fd.get("setup") ?? "") || null,
      emotion: String(fd.get("emotion") ?? "") || null,
      notes: String(fd.get("notes") ?? "") || null,
      tags: parseTags(String(fd.get("tags") ?? "")),
      mistake_tags: parseTags(String(fd.get("mistake_tags") ?? "")),
      session: String(fd.get("session") ?? "") || null,
      confidence_score: fd.get("confidence_score") ? Number(fd.get("confidence_score")) : null,
      discipline_score: fd.get("discipline_score") ? Number(fd.get("discipline_score")) : null,
      what_went_right: String(fd.get("what_went_right") ?? "") || null,
      what_went_wrong: String(fd.get("what_went_wrong") ?? "") || null,
      lesson_learned: String(fd.get("lesson_learned") ?? "") || null,
    };

    if (!draft.date || !draft.symbol || draft.symbol.trim().length === 0) {
      alert("Date and symbol are required.");
      return;
    }

    if ([draft.entry_price, draft.exit_price, draft.stop_loss, draft.risk_amount, draft.pnl].some((n) => Number.isNaN(n))) {
      alert("Prices, risk, and P/L must be numbers.");
      return;
    }

    setBusy(true);
    try {
      const { id } = await createTradeAndReturnId(draft);
      try {
        await uploadQueuedScreenshots(id, queue);
      } catch (err) {
        console.error(err);
        alert("Trade saved, but screenshot upload failed. You can retry from the trade page.");
      }
      setOpen(false);
      setQueue([]);
      router.push(`/trades/${id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Could not save trade.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 rounded-full px-4">
          <Plus className="h-4 w-4" />
          Add trade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log trade</DialogTitle>
          <DialogDescription>Fast capture first. Reflection can unfold after click.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" name="symbol" placeholder="ES, NQ, AAPL..." required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <select
                id="direction"
                name="direction"
                defaultValue="long"
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup">Setup</Label>
              <Input id="setup" name="setup" placeholder="London trend, VWAP fade..." />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entry_price">Entry</Label>
              <Input id="entry_price" name="entry_price" inputMode="decimal" placeholder="5320.25" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit_price">Exit</Label>
              <Input id="exit_price" name="exit_price" inputMode="decimal" placeholder="5326.50" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stop_loss">Stop loss</Label>
              <Input id="stop_loss" name="stop_loss" inputMode="decimal" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk_amount">Risk ($)</Label>
              <Input id="risk_amount" name="risk_amount" inputMode="decimal" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pnl">P/L ($)</Label>
              <Input id="pnl" name="pnl" inputMode="decimal" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emotion">Emotion</Label>
              <Input id="emotion" name="emotion" placeholder="calm, rushed..." />
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
              <Input id="mistake_tags" name="mistake_tags" placeholder="early entry, sized up..." />
            </div>
          </div>

          <ScreenshotQueue items={queue} onChange={setQueue} />

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
                  <Input id="session" name="session" placeholder="London, NY..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence_score">Confidence (1-10)</Label>
                  <Input id="confidence_score" name="confidence_score" inputMode="numeric" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline_score">Discipline (1-10)</Label>
                <Input id="discipline_score" name="discipline_score" inputMode="numeric" />
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save trade"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
