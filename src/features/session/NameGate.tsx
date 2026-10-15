"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionRoom } from "@/features/session/SessionRoom";
import type { SessionRow } from "@/types/session";

const NAME_KEY = "syncpair:name";

export function NameGate({ slug, initial }: { slug: string; initial: SessionRow }) {
  const [name, setName] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      // Seeding from localStorage, unavailable during SSR/prerendering.
      setName(localStorage.getItem(NAME_KEY));
    } catch {
      // Corrupt or blocked storage (private browsing) — fall through to the gate.
    } finally {
      setHydrated(true);
    }
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(NAME_KEY, trimmed);
    } catch {
      // Storage unavailable — still proceed for this visit, just not remembered next time.
    }
    setName(trimmed);
  }

  if (!hydrated) return null;

  if (!name) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <p className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          What&apos;s your name?
        </p>
        <form onSubmit={handleSubmit} className="flex w-full max-w-xs gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Gil"
            autoFocus
            maxLength={40}
          />
          <Button type="submit">Join</Button>
        </form>
      </div>
    );
  }

  return <SessionRoom slug={slug} initial={initial} name={name} />;
}
