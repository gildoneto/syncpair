"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import type { Phase } from "@/lib/timer/state-machine";
import type { SessionRow } from "@/types/session";

interface Participant {
  name: string;
}

/**
 * One Realtime channel per session (`session:<slug>`), multiplexing presence
 * and `postgres_changes` — not two separate channel subscriptions for the
 * same room. The countdown itself is never synced tick-by-tick: every client
 * computes "seconds remaining" locally from the shared `phase_ends_at`
 * (via useCountdown, same as solo mode), so Realtime only ever carries rare,
 * human-triggered state transitions.
 */
export function useSessionRoom(slug: string, initial: SessionRow, name: string | null) {
  const [row, setRow] = useState(initial);
  const [participants, setParticipants] = useState<Participant[]>([]);
  // Generated post-mount, not read from a ref during render: baking a random
  // id into a prerendered shell would hand every visitor the *same* presence
  // key, colliding their presence entries with each other.
  const [presenceKey, setPresenceKey] = useState<string | null>(null);

  useEffect(() => {
    setPresenceKey(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!presenceKey) return;
    const channel = supabase.channel(`session:${slug}`, {
      config: { presence: { key: presenceKey } },
    });

    channel
      .on<SessionRow>(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions", filter: `slug=eq.${slug}` },
        (payload) => setRow(payload.new),
      )
      .on("presence", { event: "sync" }, () => {
        setParticipants(Object.values(channel.presenceState<Participant>()).flat());
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && name) await channel.track({ name });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, name, presenceKey]);

  // Takes the duration explicitly (chosen that moment from DurationCircles,
  // mirroring the solo timer's startWithDuration) rather than reading it off
  // the row — the room no longer locks durations in at creation time, so
  // each start also writes the chosen value back into the matching column.
  //
  // Applied optimistically: waiting for our own write to round-trip back
  // through Realtime before updating the screen reads as "nothing happened"
  // on click (0.5-2s of dead air). Other participants still get the change
  // at normal Realtime speed; only the clicking client needs the shortcut.
  // Rolled back to the exact pre-click row (not just "whatever row is now")
  // if the write itself fails, with a toast — sonner's Toaster is already
  // mounted in Providers but was never actually used until this.
  const startPhase = useCallback(
    async (phase: Phase, minutes: number) => {
      const durationSec = Math.round(minutes * 60);
      const durationField = phase === "focus" ? "focus_duration_seconds" : "break_duration_seconds";
      const patch: Partial<SessionRow> = {
        phase,
        status: "running",
        phase_ends_at: new Date(Date.now() + durationSec * 1000).toISOString(),
        last_active_at: new Date().toISOString(),
        [durationField]: durationSec,
      };

      let previousRow!: SessionRow;
      setRow((current) => {
        previousRow = current;
        return { ...current, ...patch };
      });

      const { error } = await supabase.from("sessions").update(patch).eq("slug", slug);
      if (error) {
        setRow(previousRow);
        toast.error("Couldn't start — try again.");
      }
    },
    [slug],
  );

  const stopPhase = useCallback(async () => {
    // Goes back to the Focus/Break menu rather than guessing which phase
    // (and duration) to jump into next — mirrors the solo timer's "Stop".
    const patch: Partial<SessionRow> = {
      status: "idle",
      phase_ends_at: null,
      last_active_at: new Date().toISOString(),
    };

    let previousRow!: SessionRow;
    setRow((current) => {
      previousRow = current;
      return { ...current, ...patch };
    });

    const { error } = await supabase.from("sessions").update(patch).eq("slug", slug);
    if (error) {
      setRow(previousRow);
      toast.error("Couldn't stop — try again.");
    }
  }, [slug]);

  // Best-effort: whichever connected client is still open when a running
  // phase naturally hits zero writes the idle transition back. Guarded on
  // (status=running AND this exact phase_ends_at) so a race between tabs is
  // safely idempotent — only the first write matches, the rest no-op.
  useEffect(() => {
    if (row.status !== "running" || !row.phase_ends_at) return;
    const msRemaining = new Date(row.phase_ends_at).getTime() - Date.now();
    const id = setTimeout(
      () => {
        void supabase
          .from("sessions")
          .update({ status: "idle" })
          .eq("slug", slug)
          .eq("status", "running")
          .eq("phase_ends_at", row.phase_ends_at as string);
      },
      Math.max(0, msRemaining),
    );
    return () => clearTimeout(id);
  }, [slug, row.status, row.phase_ends_at]);

  return { row, participants, startPhase, stopPhase };
}
