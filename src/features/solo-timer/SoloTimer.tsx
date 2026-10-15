"use client";

import { Button } from "@/components/ui/button";
import { LampMotif } from "@/components/motifs/LampMotif";
import { DurationCircles } from "@/components/DurationCircles";
import { useCountdown } from "@/hooks/use-countdown";
import { usePresets } from "@/hooks/use-presets";
import { formatDuration } from "@/lib/timer/format";
import { useSoloTimer } from "@/features/solo-timer/useSoloTimer";

const PHASE_LABEL = { focus: "Focus", break: "Break" } as const;

export function SoloTimer() {
  const { state, startWithDuration, stop } = useSoloTimer();
  const { presets, addPreset } = usePresets();
  const secondsLeft = useCountdown(state);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <LampMotif phase={state.phase} status={state.status} className="h-48 w-36" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          {PHASE_LABEL[state.phase]}
        </span>
        <span className="text-[clamp(3.5rem,12vw,6rem)] font-extrabold tracking-[-0.02em] tabular-nums text-foreground">
          {formatDuration(secondsLeft)}
        </span>
      </div>

      {state.status === "idle" ? (
        <div className="flex flex-wrap items-start justify-center gap-10">
          <DurationCircles
            label="Focus"
            presets={presets.focus}
            value={Math.round(state.focusDurationSec / 60)}
            onSelect={(minutes) => startWithDuration("focus", minutes)}
            onAdd={(minutes) => addPreset("focus", minutes)}
          />
          <DurationCircles
            label="Break"
            presets={presets.break}
            value={Math.round(state.breakDurationSec / 60)}
            onSelect={(minutes) => startWithDuration("break", minutes)}
            onAdd={(minutes) => addPreset("break", minutes)}
          />
        </div>
      ) : (
        <Button size="lg" variant="ghost" onClick={stop}>
          Stop
        </Button>
      )}
    </div>
  );
}
