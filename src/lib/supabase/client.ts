import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

/** Browser Supabase client, or null if env is missing / invalid (safe for SSR + client bundles). */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anon) {
    browserClient = null;
    return browserClient;
  }

  try {
    new URL(url);
    browserClient = createBrowserClient(url, anon);
    return browserClient;
  } catch {
    browserClient = null;
    return browserClient;
  }
}
