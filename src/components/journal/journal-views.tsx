"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { Trade } from "@/types/database";

import { JournalCalendar } from "@/components/journal/journal-calendar";
import { TradeTable } from "@/components/journal/trade-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function JournalViews(props: { trades: Trade[] }) {
  const { trades } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab") === "calendar" ? "calendar" : "table";

  function updateTab(next: "calendar" | "table") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "calendar") params.set("tab", "calendar");
    else params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `/journal?${qs}` : "/journal");
  }

  return (
    <Tabs value={tab} onValueChange={(v) => updateTab(v as "calendar" | "table")} className="w-full">
      <TabsList>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
      </TabsList>

      <TabsContent value="table">
        <TradeTable trades={trades} />
      </TabsContent>

      <TabsContent value="calendar">
        <JournalCalendar trades={trades} />
      </TabsContent>
    </Tabs>
  );
}
