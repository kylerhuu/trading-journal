"use client";

import * as React from "react";

import type { ScreenshotType } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface QueuedScreenshot {
  id: string;
  file: File;
  type: ScreenshotType;
  caption: string;
}

const TYPE_LABELS: Record<ScreenshotType, string> = {
  before_entry: "Before entry",
  during_trade: "During trade",
  after_exit: "After exit",
  higher_timeframe: "Higher timeframe",
};

export function ScreenshotQueue(props: {
  items: QueuedScreenshot[];
  onChange: (next: QueuedScreenshot[]) => void;
}) {
  const { items, onChange } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next = [...items];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({
        id: crypto.randomUUID(),
        file,
        type: "before_entry",
        caption: "",
      });
    }
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Screenshots</div>
          <div className="text-xs text-muted-foreground">Drag in charts or executions.</div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Add files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <div
        className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center text-xs text-muted-foreground"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addFiles(e.dataTransfer.files);
        }}
      >
        Drop screenshots here
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex h-14 w-full shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground sm:h-24 sm:w-40">
                Preview on trade page
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-xs font-medium text-muted-foreground">{item.file.name}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 px-2 text-xs"
                    onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(v) => {
                        const copy = [...items];
                        copy[idx] = { ...item, type: v as ScreenshotType };
                        onChange(copy);
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TYPE_LABELS) as ScreenshotType[]).map((key) => (
                          <SelectItem key={key} value={key}>
                            {TYPE_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Caption</Label>
                    <Input
                      value={item.caption}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx] = { ...item, caption: e.target.value };
                        onChange(copy);
                      }}
                      placeholder="Note for future-you"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
