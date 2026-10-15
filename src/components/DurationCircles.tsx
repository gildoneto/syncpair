"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { circleSize } from "@/lib/circle-size";

interface DurationCirclesProps {
  label: string;
  presets: number[];
  value: number;
  onSelect: (minutes: number) => void;
  onAdd: (minutes: number) => void;
}

/**
 * Tap-to-pick duration presets sized by value (bigger circle = longer time) —
 * replaces a number input + equal-sized chips with something you read at a
 * glance, no typing required for the common case. Adding a custom value is a
 * deliberately secondary action (the small dashed "+" circle), never a
 * visible text input sitting next to the presets.
 */
export function DurationCircles({ label, presets, value, onSelect, onAdd }: DurationCirclesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function confirmAdd() {
    const minutes = Number(draft);
    if (Number.isFinite(minutes) && minutes > 0) {
      onAdd(minutes);
      onSelect(minutes);
    }
    setDraft("");
    setIsAdding(false);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">{label}</span>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {presets.map((minutes) => {
          const size = circleSize(minutes, presets);
          const selected = minutes === value;
          return (
            <button
              key={minutes}
              type="button"
              onClick={() => onSelect(minutes)}
              style={{ width: size, height: size }}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border font-bold transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {minutes}
            </button>
          );
        })}

        {isAdding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmAdd();
            }}
            className="flex items-center"
          >
            <Input
              type="number"
              min={1}
              max={180}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => !draft && setIsAdding(false)}
              placeholder="min"
              className="h-10 w-16 text-center"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            aria-label={`Add a custom ${label.toLowerCase()} duration`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:bg-muted"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
