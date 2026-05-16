"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured, shouldUseMockData } from "@/lib/mock-mode";

export function AuthPanel() {
  const { authConfigured, authReady, user, isSignedIn, signInWithEmail, signOut } = useAuth();
  const searchParams = useSearchParams();
  const authError = searchParams.get("auth_error");

  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(authError);

  React.useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        Add <span className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
        <span className="font-mono text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> to enable cloud sign-in and
        screenshot uploads.
      </p>
    );
  }

  if (shouldUseMockData()) {
    return (
      <p className="text-sm text-muted-foreground">
        <span className="font-mono text-foreground">TRADING_JOURNAL_USE_MOCK</span> is enabled. Turn it off to use live
        Supabase auth and storage.
      </p>
    );
  }

  if (!authReady) {
    return <p className="text-sm text-muted-foreground">Checking sign-in status…</p>;
  }

  if (isSignedIn && user) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
          <div className="font-medium text-emerald-50">Signed in</div>
          <div className="mt-1 text-emerald-100/90">{user.email}</div>
          <p className="mt-2 text-xs text-emerald-100/80">
            Trades and screenshots can sync to your Supabase project. New trades save to the cloud when you log them
            while signed in.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    setBusy(true);
    try {
      await signInWithEmail(trimmed, "/settings");
      setMessage("Check your inbox for a sign-in link. It expires after a short time.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send sign-in link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Use a magic link (no password). After you sign in, screenshot uploads go to the{" "}
        <span className="font-mono text-foreground">trade-screenshots</span> bucket in Supabase.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy || !authConfigured}
          />
        </div>
        <Button type="submit" disabled={busy || !authConfigured}>
          {busy ? "Sending…" : "Email me a sign-in link"}
        </Button>
      </form>

      {message ? <p className="text-sm text-emerald-400/90">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <p className="text-xs text-muted-foreground">
        In Supabase: Authentication → URL configuration — add your site URL and redirect URL{" "}
        <span className="font-mono text-foreground">/auth/callback</span> (see setup docs).
      </p>
    </div>
  );
}
