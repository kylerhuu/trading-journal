/** Supabase demo / fallback helpers. Not React hooks. */

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function isMockDataForced(): boolean {
  return process.env.TRADING_JOURNAL_USE_MOCK === "true";
}

/** Use embedded demo trades instead of querying Supabase. */
export function shouldUseMockData(): boolean {
  return !isSupabaseConfigured() || isMockDataForced();
}

/** Show demo banner whenever the journal is reading demo data paths. */
export function shouldShowDemoModeBanner(): boolean {
  return shouldUseMockData();
}
