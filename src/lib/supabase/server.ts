import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return null;

  try {
    // Reject malformed URLs before @supabase/ssr throws during render.
    new URL(url);
  } catch {
    return null;
  }

  try {
    const cookieStore = await cookies();

    return createServerClient(url, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Typical when called from a Server Component that cannot mutate cookies.
          }
        },
      },
    });
  } catch {
    return null;
  }
}
