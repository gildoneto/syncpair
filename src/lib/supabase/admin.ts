import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Used only by the session-expiry
 * cron route (src/app/api/cron/expire-sessions), which is the one place that
 * needs to delete rows (no `delete` policy is granted to `anon`). Never import
 * this from anything that runs in, or could be bundled into, the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
