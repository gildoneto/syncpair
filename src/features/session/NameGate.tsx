"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIdentity } from "@/hooks/use-identity";
import { SessionRoom } from "@/features/session/SessionRoom";
import type { SessionRow } from "@/types/session";

export function NameGate({ slug, initial }: { slug: string; initial: SessionRow }) {
  const { name, hydrated, setName } = useIdentity();
  const [draft, setDraft] = useState("");

  if (!hydrated) return null;

  if (!name) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <p className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          What&apos;s your name?
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setName(draft);
          }}
          className="flex w-full max-w-xs gap-2"
        >
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
