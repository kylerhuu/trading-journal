export function deriveRMultiple(pnl: number, riskAmount: number): number | null {
  if (!riskAmount || !Number.isFinite(riskAmount)) return null;
  return pnl / riskAmount;
}
