"use client";

import { Button } from "@/components/ui/button";
import { LampMotif } from "@/components/motifs/LampMotif";
import { useCountdown } from "@/hooks/use-countdown";
import { formatDuration } from "@/lib/timer/format";
import { useSoloTimer } from "@/features/solo-timer/useSoloTimer";

const PHASE_LABEL = { focus: "Foco", break: "Pausa" } as const;

export function SoloTimer() {
  const { state, start } = useSoloTimer();
  const secondsLeft = useCountdown(state);
  const otherPhase = state.phase === "focus" ? "break" : "focus";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <LampMotif phase={state.phase} status={state.status} className="h-48 w-36" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {PHASE_LABEL[state.phase]}
        </span>
        <span className="font-mono text-7xl font-semibold tabular-nums text-foreground">
          {formatDuration(secondsLeft)}
        </span>
      </div>

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
