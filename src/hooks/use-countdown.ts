"use client";

import { useEffect, useState } from "react";
import { type TimerState, secondsRemaining } from "@/lib/timer/state-machine";

/**
 * Mode-agnostic: ticks a render every second while running and recomputes
 * the remaining time from the shared `endsAt` timestamp each time, rather
 * than counting down locally. That's what keeps every open tab (solo or
 * multi-participant) in agreement without needing a per-second sync message.
 */
export function useCountdown(state: TimerState): number {
  // Deliberately not `Date.now()` here: reading the clock during render (even
  // in a lazy initializer) trips Next's "unstable value in a Client Component"
  // prerender check. 0 is fine as the pre-mount placeholder because state is
  // always "idle" before the first effect runs, and secondsRemaining ignores
  // `now` entirely on that branch.
  const [now, setNow] = useState(0);

  useEffect(() => {
    // Seeding from a non-deterministic read (the clock), not derivable from
    // props/state — see eslint.config.mjs for why this rule is a warning.
    setNow(Date.now());
    if (state.status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.status, state.endsAt]);

  return secondsRemaining(state, now);
}
