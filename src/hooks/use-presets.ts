"use client";

import { useEffect, useState } from "react";

export interface PresetsState {
  focus: number[];
  break: number[];
}

const STORAGE_KEY = "syncpair:presets";
const DEFAULT_PRESETS: PresetsState = { focus: [15, 25, 45], break: [5, 10, 15] };

function addSorted(list: number[], minutes: number): number[] {
  if (list.includes(minutes)) return list;
  return [...list, minutes].sort((a, b) => a - b);
}

/**
 * One shared list of focus/break duration presets, used by both the solo
 * timer and the create-session wizard — a preset saved in either place shows
 * up clickable in both.
 */
export function usePresets() {
  const [presets, setPresets] = useState<PresetsState>(DEFAULT_PRESETS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPresets(JSON.parse(raw) as PresetsState);
    } catch {
      // Corrupt or blocked storage (private browsing) — keep the defaults.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {
      // Storage unavailable — presets still work for this tab, just not saved.
    }
  }, [hydrated, presets]);

  function addPreset(kind: keyof PresetsState, minutes: number) {
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    setPresets((prev) => ({ ...prev, [kind]: addSorted(prev[kind], Math.round(minutes)) }));
  }

  return { presets, addPreset };
}
