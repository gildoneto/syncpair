import type { TimerState } from "@/lib/timer/state-machine";

export interface SessionRow {
  id: string;
  slug: string;
  created_at: string;
  last_active_at: string;
  created_by_name: string | null;
  phase: "focus" | "break";
  status: "idle" | "running";
  phase_ends_at: string | null;
  focus_duration_seconds: number;
  break_duration_seconds: number;
}

/** Lets a session row feed the same pure timer logic/hooks the solo mode uses. */
export function sessionRowToTimerState(row: SessionRow): TimerState {
  return {
    phase: row.phase,
    status: row.status,
    endsAt: row.phase_ends_at,
    focusDurationSec: row.focus_duration_seconds,
    breakDurationSec: row.break_duration_seconds,
  };
}
