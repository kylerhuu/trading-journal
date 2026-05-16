import { TradeDetailClient } from "@/components/trades/trade-detail-client";
import { fetchTradeById } from "@/lib/trades/fetch-trades.server";

export default async function TradePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const initialTrade = await fetchTradeById(id);

  return <TradeDetailClient tradeId={id} initialTrade={initialTrade} />;
}
