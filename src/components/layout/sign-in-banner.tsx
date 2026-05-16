"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";

export function SignInBanner() {
  const { authConfigured, authReady, isSignedIn } = useAuth();

  if (!authConfigured || !authReady || isSignedIn) return null;

  return (
    <div
      role="status"
      className="border-b border-sky-500/35 bg-sky-500/10 px-4 py-3 text-sm text-sky-100 lg:px-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="font-medium text-sky-50">Sign in for cloud storage</div>
          <p className="text-xs leading-relaxed text-sky-100/90">
            Trades and screenshots are only saved to Supabase when you are signed in. Until then, this browser uses
            local storage.
          </p>
        </div>
        <Link
          href="/settings#account"
          className="shrink-0 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-medium text-sky-50 hover:bg-sky-500/25"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
