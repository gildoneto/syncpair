"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PresetPickerProps {
  id: string;
  label: string;
  value: number;
  presets: number[];
  onChange: (minutes: number) => void;
  onAdd: (minutes: number) => void;
}

/** A duration input backed by a row of saved, clickable presets (shared via usePresets). */
export function PresetPicker({ id, label, value, presets, onChange, onAdd }: PresetPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          min={1}
          max={180}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onAdd(value)}
          aria-label={`Salvar ${value} min como opção`}
        >
          <Plus />
        </Button>
      </div>
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => onChange(minutes)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                minutes === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {minutes} min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
