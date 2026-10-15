import { createClient } from "@supabase/supabase-js";

/**
 * Factory, not a singleton: a fresh instance per Server Component render
 * avoids any cross-request state leaking through a module-level client.
 *
 * Plain anon-key client, not `@supabase/ssr`'s cookie-bridging server client
 * — that package exists to share a logged-in user's Auth session between
 * server and browser, and Syncpair has no Supabase Auth session to bridge
 * (decision #4). RLS policies grant the `anon` role everything this app
 * needs, so there's nothing for a cookie-aware client to add here.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
