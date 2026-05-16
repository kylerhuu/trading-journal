/** Whether to use in-memory demo data instead of Supabase. Not a React hook. */
export function shouldUseMockData(): boolean {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL == null ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "" ||
    process.env.TRADING_JOURNAL_USE_MOCK === "true"
  );
}
