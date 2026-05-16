import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Workspace</div>
        <div className="text-3xl font-semibold tracking-tight">Settings</div>
        <div className="max-w-2xl text-sm text-muted-foreground">
          Configure Supabase once. Keep the UI calm forever.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Environment variables</CardTitle>
            <CardDescription>Copy into Vercel or local `.env.local`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CodeRow k="NEXT_PUBLIC_SUPABASE_URL" />
            <CodeRow k="NEXT_PUBLIC_SUPABASE_ANON_KEY" />
            <CodeRow k="MONTHLY_GOAL_USD" hint="Example: 5000" />
            <CodeRow k="TRADING_JOURNAL_USE_MOCK" hint='Set to "true" to force mock data even if Supabase exists.' />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Supabase checklist</CardTitle>
            <CardDescription>Matches `supabase/migrations/001_schema.sql`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              - Run the SQL migration for <span className="font-mono text-foreground">trades</span>,{" "}
              <span className="font-mono text-foreground">trade_screenshots</span>, and{" "}
              <span className="font-mono text-foreground">daily_reviews</span>.
            </div>
            <div>
              - Create a <strong>public</strong> bucket named{" "}
              <span className="font-mono text-foreground">trade-screenshots</span> (see{" "}
              <span className="font-mono text-foreground">supabase/SETUP.md</span>).
            </div>
            <div>
              - Run <span className="font-mono text-foreground">supabase/storage-policies.sql</span> after creating the bucket.
            </div>
            <div>
              Without Supabase, trades save to <span className="font-mono text-foreground">localStorage</span> in this browser.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CodeRow({ k, hint }: { k: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/10 px-4 py-3">
      <div className="font-mono text-xs text-foreground">{k}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
