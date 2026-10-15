import { createClient } from "@supabase/supabase-js";

/**
 * Browser singleton. Safe to share across the whole client-side app: there's
 * no Supabase Auth session to isolate per request (decision #4 — Syncpair
 * has no accounts at all), so this is just an anon-key REST/Realtime client.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
