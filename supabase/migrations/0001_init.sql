-- Syncpair: sessions table + RLS.
--
-- No `participants` table on purpose: presence (who's in the room right now)
-- is handled entirely by Supabase Realtime's Presence API — ephemeral,
-- in-memory, cleaned up automatically when a socket closes. `created_by_name`
-- below is the only persisted name, and it's a cosmetic label, never an
-- identity binding (decision #4 — no accounts, ever).

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  created_by_name text,
  phase text not null default 'focus' check (phase in ('focus', 'break')),
  status text not null default 'idle' check (status in ('idle', 'running')),
  phase_ends_at timestamptz,
  focus_duration_seconds integer not null default 1500 check (focus_duration_seconds > 0),
  break_duration_seconds integer not null default 300  check (break_duration_seconds > 0)
);

create index sessions_last_active_at_idx on public.sessions (last_active_at);

alter table public.sessions enable row level security;

-- No accounts (decision #4), so every policy targets the anon role. This is
-- an accepted, low-severity risk for a free hobby project: rows are tiny
-- (~200 bytes) and the daily expiry cron (see src/app/api/cron/expire-sessions)
-- caps worst-case accumulation at ~2 days of unchecked writes.
create policy "sessions_select_anon" on public.sessions for select to anon using (true);
create policy "sessions_insert_anon" on public.sessions for insert to anon with check (true);
create policy "sessions_update_anon" on public.sessions for update to anon using (true) with check (true);
-- Deliberately no delete policy for anon: default-deny. Only the service_role
-- key (used solely by the expiry cron) can delete rows.

-- RLS is row-level only; layer a column-level grant so "anyone can update a
-- row" (inherent to the no-auth model) still can't rewrite slug/id/created_at.
revoke update on public.sessions from anon;
grant update (
  phase, status, phase_ends_at,
  focus_duration_seconds, break_duration_seconds,
  last_active_at
) on public.sessions to anon;

-- Make row UPDATEs available to Realtime's postgres_changes listeners.
alter publication supabase_realtime add table public.sessions;
