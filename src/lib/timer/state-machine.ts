export type Phase = "focus" | "break";
export type Status = "idle" | "running";

export interface TimerState {
  phase: Phase;
  status: Status;
  /** ISO timestamp; set only while status === "running". */
  endsAt: string | null;
  focusDurationSec: number;
  breakDurationSec: number;
}

export function createInitialTimerState(
  focusDurationSec: number,
  breakDurationSec: number,
): TimerState {
  return { phase: "focus", status: "idle", endsAt: null, focusDurationSec, breakDurationSec };
}

export function startPhase(state: TimerState, phase: Phase, now = Date.now()): TimerState {
  const durationSec = phase === "focus" ? state.focusDurationSec : state.breakDurationSec;
  return {
    ...state,
    phase,
    status: "running",
    endsAt: new Date(now + durationSec * 1000).toISOString(),
  };
}

/**
 * Manual-reset model (decision #5): flips to idle on the *other* phase, but
 * never auto-starts it. Someone still has to click to begin the next block.
 */
export function expirePhase(state: TimerState): TimerState {
  return { ...state, status: "idle", endsAt: null, phase: state.phase === "focus" ? "break" : "focus" };
}

export function isExpired(state: TimerState, now = Date.now()): boolean {
  return state.status === "running" && state.endsAt !== null && new Date(state.endsAt).getTime() <= now;
}

export function secondsRemaining(state: TimerState, now = Date.now()): number {
  if (state.status !== "running" || state.endsAt === null) {
    return state.phase === "focus" ? state.focusDurationSec : state.breakDurationSec;
  }
  return Math.max(0, Math.round((new Date(state.endsAt).getTime() - now) / 1000));
}
