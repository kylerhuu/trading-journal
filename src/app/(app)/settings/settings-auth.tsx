"use client";

import { Suspense } from "react";

import { AuthPanel } from "@/components/auth/auth-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsAuthCard() {
  return (
    <Card id="account" className="rounded-xl border-border bg-card lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Account & cloud sync</CardTitle>
        <CardDescription>Sign in to save trades and upload screenshots to Supabase.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <AuthPanel />
        </Suspense>
      </CardContent>
    </Card>
  );
}
