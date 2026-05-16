import { TradeTable } from "@/components/journal/trade-table";
import { fetchTrades } from "@/lib/trade-queries";

export default async function TradesPage() {
  const trades = await fetchTrades();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Ledger</div>
        <div className="text-3xl font-semibold tracking-tight">Trades</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          Same interactive table as the Journal tab, reachable directly from the sidebar.
        </div>
      </div>

      <TradeTable trades={trades} />
    </div>
  );
}
