import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

/** Exchange magic-link `code` for a session and redirect into the app. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        const redirect = new URL("/settings", url.origin);
        redirect.searchParams.set("auth_error", error.message);
        return NextResponse.redirect(redirect);
      }
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
