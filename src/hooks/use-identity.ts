"use client";

import { useEffect, useState } from "react";

const NAME_KEY = "syncpair:name";

/**
 * One global name, not scoped to any session — set once (solo timer or
 * joining a session), remembered everywhere, shown via UserBadge wherever
 * identity is displayed.
 */
export function useIdentity() {
  const [name, setNameState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      // Seeding from localStorage, unavailable during SSR/prerendering.
      setNameState(localStorage.getItem(NAME_KEY));
    } catch {
      // Corrupt or blocked storage (private browsing) — stays unset for this visit.
    } finally {
      setHydrated(true);
    }
  }, []);

  function setName(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(NAME_KEY, trimmed);
    } catch {
      // Storage unavailable — still works for this visit, just not remembered next time.
    }
    setNameState(trimmed);
  }

  return { name, hydrated, setName };
}
