"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { LampMotif } from "@/components/motifs/LampMotif";
import { DurationCircles } from "@/components/DurationCircles";
import { useCountdown } from "@/hooks/use-countdown";
import { usePresets } from "@/hooks/use-presets";
import { formatDuration } from "@/lib/timer/format";
import { useSoloTimer } from "@/features/solo-timer/useSoloTimer";
import type { Phase } from "@/lib/timer/state-machine";

const PHASE_LABEL = { focus: "Focus", break: "Break" } as const;

// Idle starts at "menu" (just the three entry points) instead of showing both
// duration pickers at once — picking Focus or Break reveals only that one's
// circles, mirroring cuckoo.team's progressive-reveal homepage.
type IdleView = "menu" | Phase;

export function SoloTimer() {
  const { state, startWithDuration, stop } = useSoloTimer();
  const { presets, addPreset } = usePresets();
  const secondsLeft = useCountdown(state);
  const [idleView, setIdleView] = useState<IdleView>("menu");

  const isPicking = state.status === "idle" && idleView !== "menu";
  const displayPhase: Phase = state.status === "running" ? state.phase : idleView === "break" ? "break" : "focus";
  const displaySeconds =
    state.status === "running"
      ? secondsLeft
      : displayPhase === "focus"
        ? state.focusDurationSec
        : state.breakDurationSec;

  function handleStop() {
    stop();
    setIdleView("menu");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <LampMotif phase={state.phase} status={state.status} className="h-48 w-36" />

      {(state.status === "running" || isPicking) && (
        <div className="flex flex-col items-center gap-2">
          {state.status === "running" && (
            <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
              {PHASE_LABEL[displayPhase]}
            </span>
          )}
          <span className="text-[clamp(3.5rem,12vw,6rem)] font-extrabold tracking-[-0.02em] tabular-nums text-foreground">
            {formatDuration(displaySeconds)}
          </span>
        </div>
      )}

      {state.status === "running" ? (
        <Button size="lg" variant="ghost" onClick={handleStop}>
          Stop
        </Button>
      ) : idleView === "menu" ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => setIdleView("focus")}>
            Focus
          </Button>
          <Button size="lg" variant="outline" onClick={() => setIdleView("break")}>
            Break
          </Button>
          <Link href="/new" className={buttonVariants({ size: "lg", variant: "ghost" })}>
            Create a shared session
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <DurationCircles
            label={PHASE_LABEL[idleView]}
            presets={presets[idleView]}
            value={Math.round((idleView === "focus" ? state.focusDurationSec : state.breakDurationSec) / 60)}
            onSelect={(minutes) => startWithDuration(idleView, minutes)}
            onAdd={(minutes) => addPreset(idleView, minutes)}
          />
          <Button size="sm" variant="ghost" onClick={() => setIdleView("menu")}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
