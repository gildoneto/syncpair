"use client";

import { useCallback, useEffect, useState } from "react";
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

  const startPhase = useCallback(
    async (phase: Phase) => {
      const durationSec = phase === "focus" ? row.focus_duration_seconds : row.break_duration_seconds;
      await supabase
        .from("sessions")
        .update({
          phase,
          status: "running",
          phase_ends_at: new Date(Date.now() + durationSec * 1000).toISOString(),
          last_active_at: new Date().toISOString(),
        })
        .eq("slug", slug);
    },
    [slug, row.focus_duration_seconds, row.break_duration_seconds],
  );

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

  return { row, participants, startPhase };
}
