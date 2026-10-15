"use client";

import { Button } from "@/components/ui/button";
import { LampMotif } from "@/components/motifs/LampMotif";
import { PresetPicker } from "@/components/PresetPicker";
import { useCountdown } from "@/hooks/use-countdown";
import { usePresets } from "@/hooks/use-presets";
import { formatDuration } from "@/lib/timer/format";
import { useSoloTimer } from "@/features/solo-timer/useSoloTimer";

const PHASE_LABEL = { focus: "Foco", break: "Pausa" } as const;

export function SoloTimer() {
  const { state, start, setDuration } = useSoloTimer();
  const { presets, addPreset } = usePresets();
  const secondsLeft = useCountdown(state);
  const otherPhase = state.phase === "focus" ? "break" : "focus";

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

      {state.status === "idle" && (
        <div className="flex flex-wrap items-start justify-center gap-6">
          <PresetPicker
            id="solo-focus-minutes"
            label="Foco (min)"
            value={Math.round(state.focusDurationSec / 60)}
            presets={presets.focus}
            onChange={(minutes) => setDuration("focus", minutes)}
            onAdd={(minutes) => addPreset("focus", minutes)}
          />
          <PresetPicker
            id="solo-break-minutes"
            label="Pausa (min)"
            value={Math.round(state.breakDurationSec / 60)}
            presets={presets.break}
            onChange={(minutes) => setDuration("break", minutes)}
            onAdd={(minutes) => addPreset("break", minutes)}
          />
        </div>
      )}

      {state.status === "idle" ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => start(state.phase)}>
            Começar {PHASE_LABEL[state.phase].toLowerCase()}
          </Button>
          <Button size="lg" variant="outline" onClick={() => start(otherPhase)}>
            Começar {PHASE_LABEL[otherPhase].toLowerCase()}
          </Button>
        </div>
      ) : (
        <Button size="lg" variant="ghost" onClick={() => start(otherPhase)}>
          Pular para {PHASE_LABEL[otherPhase].toLowerCase()}
        </Button>
      )}
    </div>
  );
}
