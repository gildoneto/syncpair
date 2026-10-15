"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DurationCircles } from "@/components/DurationCircles";
import { usePresets } from "@/hooks/use-presets";
import { slugify } from "@/lib/slug";
import { createSession } from "@/features/session/actions";

const ERROR_MESSAGE = {
  "nome-invalido": "That name won't work — try letters, numbers and hyphens only.",
  "slug-em-uso": "That name is already taken right now. Try another one.",
} as const;

type Step = 0 | 1 | 2;

export function NewSessionWizard() {
  const router = useRouter();
  const { presets, addPreset } = usePresets();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(0);
  const [slugInput, setSlugInput] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [host, setHost] = useState("");

  useEffect(() => {
    // Seeding from window.location, unavailable during SSR/prerendering.
    setHost(window.location.host);
  }, []);

  const preview = slugify(slugInput);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createSession({
        slug: slugInput || undefined,
        creatorName: creatorName || undefined,
        focusMinutes,
        breakMinutes,
      });
      if (result.error) {
        setError(ERROR_MESSAGE[result.error]);
        return;
      }
      router.push(`/${result.slug}`);
    });
  }

  if (step === 0) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-foreground">Name your session</h1>
        <div className="flex w-full flex-col gap-1.5">
          <Label htmlFor="slug">Session name (optional)</Label>
          <Input
            id="slug"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="co-writing"
            maxLength={32}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            {host || "syncpair.vercel.app"}/{preview || "—"} · leave blank for a random link
          </p>
        </div>
        <div className="flex w-full items-center justify-center gap-3">
          <Button variant="outline" size="lg" onClick={() => setStep(1)}>
            Skip
          </Button>
          <Button size="lg" onClick={() => setStep(1)}>
            Continue →
          </Button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-foreground">What&apos;s your name?</h1>
        <div className="flex w-full flex-col gap-1.5">
          <Label htmlFor="creatorName">Your name (optional)</Label>
          <Input
            id="creatorName"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="e.g. Gil"
            maxLength={40}
            autoFocus
          />
        </div>
        <div className="flex w-full items-center justify-center gap-3">
          <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
            ← Back
          </Button>
          <Button size="lg" onClick={() => setStep(2)}>
            Continue →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <h1 className="text-2xl font-bold text-foreground">Pick your durations</h1>
      <div className="flex flex-wrap items-start justify-center gap-10">
        <DurationCircles
          label="Focus"
          presets={presets.focus}
          value={focusMinutes}
          onSelect={setFocusMinutes}
          onAdd={(minutes) => addPreset("focus", minutes)}
        />
        <DurationCircles
          label="Break"
          presets={presets.break}
          value={breakMinutes}
          onSelect={setBreakMinutes}
          onAdd={(minutes) => addPreset("break", minutes)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex w-full items-center justify-center gap-3">
        <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
          ← Back
        </Button>
        <Button size="lg" disabled={isPending} onClick={handleCreate}>
          {isPending ? "Creating…" : "Create session"}
        </Button>
      </div>
    </div>
  );
}
