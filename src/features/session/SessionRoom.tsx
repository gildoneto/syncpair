"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LampMotif } from "@/components/motifs/LampMotif";
import { useCountdown } from "@/hooks/use-countdown";
import { formatDuration } from "@/lib/timer/format";
import { sessionRowToTimerState, type SessionRow } from "@/types/session";
import { useSessionRoom } from "@/features/session/useSessionRoom";

const PHASE_LABEL = { focus: "Foco", break: "Pausa" } as const;

export function SessionRoom({
  slug,
  initial,
  name,
}: {
  slug: string;
  initial: SessionRow;
  name: string;
}) {
  const { row, participants, startPhase } = useSessionRoom(slug, initial, name);
  const state = sessionRowToTimerState(row);
  const secondsLeft = useCountdown(state);
  const otherPhase = state.phase === "focus" ? "break" : "focus";
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <LampMotif phase={state.phase} status={state.status} className="h-48 w-36" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          {PHASE_LABEL[state.phase]}
        </span>
        <span className="text-[clamp(3.5rem,12vw,6rem)] font-extrabold tracking-[-0.02em] tabular-nums text-foreground">
          {formatDuration(secondsLeft)}
        </span>
      </div>

      {/* Any participant can advance the timer — there's no durable way to tell
          "the creator" apart from anyone else without accounts (decision #4),
          and creator-only control would strand the group if they disconnect. */}
      {state.status === "idle" ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => startPhase(state.phase)}>
            Começar {PHASE_LABEL[state.phase].toLowerCase()}
          </Button>
          <Button size="lg" variant="outline" onClick={() => startPhase(otherPhase)}>
            Começar {PHASE_LABEL[otherPhase].toLowerCase()}
          </Button>
        </div>
      ) : (
        <Button size="lg" variant="ghost" onClick={() => startPhase(otherPhase)}>
          Pular para {PHASE_LABEL[otherPhase].toLowerCase()}
        </Button>
      )}

      <div className="flex flex-col items-center gap-3">
        {participants.length > 0 && (
          <p className="text-sm text-muted-foreground">{participants.map((p) => p.name).join(", ")}</p>
        )}
        <Button variant="ghost" size="sm" onClick={copyLink}>
          {copied ? "Link copiado!" : "Copiar link da sessão"}
        </Button>
      </div>
    </div>
  );
}
