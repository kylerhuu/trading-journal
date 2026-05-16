import Link from "next/link";

import { isSupabaseConfigured, shouldShowDemoModeBanner } from "@/lib/mock-mode";

export function DemoModeBanner() {
  if (!shouldShowDemoModeBanner()) return null;

  const configured = isSupabaseConfigured();

  return (
    <div
      role="status"
      className="border-b border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 lg:px-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="font-medium text-amber-50">Demo data mode</div>
          <p className="text-xs leading-relaxed text-amber-100/90">
            {!configured ? (
              <>
                Supabase is not configured. Trades save to this browser (localStorage) and demo seed data.
                Add env vars on Vercel, redeploy, and run the SQL migration for cloud sync.
              </>
            ) : (
              <>TRADING_JOURNAL_USE_MOCK is enabled, so sample data replaces live Supabase queries.</>
            )}
          </p>
        </div>
        <Link
          href="/settings"
          className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-50 hover:bg-amber-500/25"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
