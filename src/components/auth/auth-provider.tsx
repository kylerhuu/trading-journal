"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, shouldUseMockData } from "@/lib/mock-mode";

interface AuthContextValue {
  /** Supabase env is set and mock mode is off — cloud auth is available. */
  authConfigured: boolean;
  authReady: boolean;
  user: User | null;
  isSignedIn: boolean;
  signInWithEmail: (email: string, redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authConfigured = isSupabaseConfigured() && !shouldUseMockData();
  const [user, setUser] = React.useState<User | null>(null);
  const [authReady, setAuthReady] = React.useState(!authConfigured);

  React.useEffect(() => {
    if (!authConfigured) {
      setUser(null);
      setAuthReady(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setUser(data.session?.user ?? null);
        setAuthReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [authConfigured]);

  const signInWithEmail = React.useCallback(
    async (email: string, redirectPath = "/dashboard") => {
      if (!authConfigured) {
        throw new Error("Supabase is not configured for cloud sign-in.");
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Could not connect to Supabase.");

      const next = redirectPath.startsWith("/") ? redirectPath : "/dashboard";
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo },
      });

      if (error) throw error;
    },
    [authConfigured],
  );

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  }, [router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      authConfigured,
      authReady,
      user,
      isSignedIn: Boolean(user),
      signInWithEmail,
      signOut,
    }),
    [authConfigured, authReady, user, signInWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
