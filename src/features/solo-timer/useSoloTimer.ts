"use client";

import { useEffect, useReducer, useState } from "react";
import {
  createInitialTimerState,
  expirePhase,
  isExpired,
  startPhase,
  type Phase,
  type TimerState,
} from "@/lib/timer/state-machine";

const STORAGE_KEY = "syncpair:solo-timer";
const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

type Action =
  | { type: "start"; phase: Phase }
  | { type: "tick" }
  | { type: "hydrate"; state: TimerState }
  | { type: "startWithDuration"; phase: Phase; minutes: number };

function withDuration(state: TimerState, phase: Phase, minutes: number): TimerState {
  const seconds = Math.round(minutes * 60);
  return phase === "focus" ? { ...state, focusDurationSec: seconds } : { ...state, breakDurationSec: seconds };
}

function reducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case "start":
      return startPhase(state, action.phase);
    case "tick":
      return isExpired(state) ? expirePhase(state) : state;
    case "hydrate":
      return action.state;
    case "startWithDuration": {
      if (!Number.isFinite(action.minutes) || action.minutes <= 0) return state;
      return startPhase(withDuration(state, action.phase, action.minutes), action.phase);
    }
  }
}

/**
 * Zero-backend timer for the solo quick-timer mode (decision #6): no Supabase
 * import anywhere in this file. State lives in localStorage only, so a
 * refresh doesn't lose progress but nothing is ever shared with anyone else.
 */
export function useSoloTimer() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => createInitialTimerState(DEFAULT_FOCUS_MINUTES * 60, DEFAULT_BREAK_MINUTES * 60),
  );
  // Gates the persist effect below until after hydration has been attempted.
  // Without this, the first commit's persist effect (still closed over the
  // pre-hydration default state) fires in the same pass as the hydrate
  // effect and overwrites the just-read saved state with that default,
  // before the hydrate dispatch's re-render ever lands.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) as TimerState });
    } catch {
      // Corrupt or blocked storage (private browsing) — keep the default state.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable — the timer still works for this tab, just not across reloads.
    }
  }, [hydrated, state]);

  useEffect(() => {
    if (state.status !== "running") return;
    const id = setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => clearInterval(id);
  }, [state.status, state.endsAt]);

  return {
    state,
    start: (phase: Phase) => dispatch({ type: "start", phase }),
    startWithDuration: (phase: Phase, minutes: number) => dispatch({ type: "startWithDuration", phase, minutes }),
  };
}
