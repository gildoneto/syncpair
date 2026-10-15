/**
 * Upper end of the "~24-48h" inactivity window — see CLAUDE.md for the
 * sustainability rationale (this cron also keeps the Supabase free-tier
 * project from auto-pausing after 7 days of low activity).
 */
export const SESSION_EXPIRY_HOURS = 48;
