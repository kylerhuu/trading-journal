import { notFound } from "next/navigation";

import { TradeDetail } from "@/components/trades/trade-detail";
import { fetchScreenshots, fetchTradeById } from "@/lib/trade-queries";

export default async function TradePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const trade = await fetchTradeById(id);
  if (!trade) notFound();

  const screenshots = await fetchScreenshots(id);

  return <TradeDetail trade={trade} screenshots={screenshots} />;
}
