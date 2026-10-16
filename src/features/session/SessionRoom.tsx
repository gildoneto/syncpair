"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TimerControl } from "@/components/TimerControl";
import { usePresets } from "@/hooks/use-presets";
import { sessionRowToTimerState, type SessionRow } from "@/types/session";
import { useSessionRoom } from "@/features/session/useSessionRoom";

export function SessionRoom({
  slug,
  initial,
  name,
}: {
  slug: string;
  initial: SessionRow;
  name: string;
}) {
  const { row, participants, startPhase, stopPhase } = useSessionRoom(slug, initial, name);
  const { presets, addPreset } = usePresets();
  const state = sessionRowToTimerState(row);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      {/* Same Focus/Break menu → duration circles as the solo timer (decision
          shared via TimerControl) — any participant can pick a phase and
          duration, there's no durable "creator" to restrict it to (decision #4). */}
      <TimerControl
        state={state}
        presets={presets}
        onStart={startPhase}
        onStop={stopPhase}
        onAddPreset={addPreset}
      />

      <div className="flex flex-col items-center gap-3">
        {participants.length > 0 && (
          <p className="text-sm text-muted-foreground">{participants.map((p) => p.name).join(", ")}</p>
        )}
        <Button variant="ghost" size="sm" onClick={copyLink}>
          {copied ? "Link copied!" : "Copy session link"}
        </Button>
      </div>
    </div>
  );
}
