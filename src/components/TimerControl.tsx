"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LampMotif } from "@/components/motifs/LampMotif";
import { DurationCircles } from "@/components/DurationCircles";
import { useCountdown } from "@/hooks/use-countdown";
import type { PresetsState } from "@/hooks/use-presets";
import { formatDuration } from "@/lib/timer/format";
import type { Phase, TimerState } from "@/lib/timer/state-machine";

const PHASE_LABEL = { focus: "Focus", break: "Break" } as const;

// Idle starts at "menu" (just the phase choices) instead of showing both
// duration pickers at once — picking Focus or Break reveals only that one's
// circles, mirroring cuckoo.team's progressive-reveal homepage. Shared by the
// solo timer and the session room so both follow the exact same pattern.
type IdleView = "menu" | Phase;

interface TimerControlProps {
  state: TimerState;
  presets: PresetsState;
  onStart: (phase: Phase, minutes: number) => void;
  onStop: () => void;
  onAddPreset: (phase: Phase, minutes: number) => void;
  /** Extra buttons appended to the idle menu, after Focus/Break (e.g. the solo timer's "Create a shared session"). */
  menuExtra?: ReactNode;
}

export function TimerControl({ state, presets, onStart, onStop, onAddPreset, menuExtra }: TimerControlProps) {
  const secondsLeft = useCountdown(state);
  const [idleView, setIdleView] = useState<IdleView>("menu");

  function handleStop() {
    onStop();
    setIdleView("menu");
  }

  return (
    <>
      <LampMotif phase={state.phase} status={state.status} className="h-48 w-36" />

      {/* The big clock only ever shows while actually running — showing it
          during picking (with a highlighted "current" circle) read as "this
          is already going," and people tapped the highlighted circle like
          they were confirming a selection rather than starting the timer. */}
      {state.status === "running" && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
            {PHASE_LABEL[state.phase]}
          </span>
          <span className="text-[clamp(3.5rem,12vw,6rem)] font-extrabold tracking-[-0.02em] tabular-nums text-foreground">
            {formatDuration(secondsLeft)}
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
          {menuExtra}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <DurationCircles
            label={PHASE_LABEL[idleView]}
            presets={presets[idleView]}
            onSelect={(minutes) => onStart(idleView, minutes)}
            onAdd={(minutes) => onAddPreset(idleView, minutes)}
          />
          <Button size="sm" variant="ghost" onClick={() => setIdleView("menu")}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
      )}
    </>
  );
}
