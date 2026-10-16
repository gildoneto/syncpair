"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TimerControl } from "@/components/TimerControl";
import { usePresets } from "@/hooks/use-presets";
import { useSoloTimer } from "@/features/solo-timer/useSoloTimer";

export function SoloTimer() {
  const { state, startWithDuration, stop } = useSoloTimer();
  const { presets, addPreset } = usePresets();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <TimerControl
        state={state}
        presets={presets}
        onStart={startWithDuration}
        onStop={stop}
        onAddPreset={addPreset}
        menuExtra={
          <Link href="/new" className={buttonVariants({ size: "lg", variant: "ghost" })}>
            Create a shared session
          </Link>
        }
      />
    </div>
  );
}
