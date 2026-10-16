"use client";

import { useState } from "react";
import { User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserBadge } from "@/components/UserBadge";
import { useIdentity } from "@/hooks/use-identity";

/**
 * Your own identity badge, shown in the site header on every page — solo
 * timer or session. No name set yet: a dashed placeholder (same visual
 * language as DurationCircles' "add custom" button) that opens a tiny inline
 * input on click, same pattern as changing an already-set name.
 */
export function MyIdentityBadge() {
  const { name, hydrated, setName } = useIdentity();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!hydrated) return null;

  if (editing) {
    function cancel() {
      setEditing(false);
      setDraft("");
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setName(draft);
          setEditing(false);
        }}
        className="flex items-center gap-1"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && cancel()}
          onBlur={cancel}
          placeholder="Your name"
          autoFocus
          maxLength={40}
          className="h-9 w-24 text-xs"
        />
        {/* onMouseDown (not onClick): fires before the input's blur, so this
            isn't a race against `cancel` already having cleared the form. */}
        <button
          type="button"
          onMouseDown={cancel}
          aria-label="Cancel"
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="size-3.5" />
        </button>
      </form>
    );
  }

  if (!name) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Set your name"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:bg-muted"
      >
        <User className="size-4" />
      </button>
    );
  }

  return (
    <UserBadge
      name={name}
      size="sm"
      onClick={() => {
        setDraft(name);
        setEditing(true);
      }}
    />
  );
}
