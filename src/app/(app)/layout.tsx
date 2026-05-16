import { AppShell } from "@/components/layout/app-shell";
import { fetchTrades } from "@/lib/trades/fetch-trades";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const initialTrades = await fetchTrades();
  return <AppShell initialTrades={initialTrades}>{children}</AppShell>;
}
