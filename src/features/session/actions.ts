"use server";

import { createServerClient } from "@/lib/supabase/server";
import { generateSlug, slugify, RESERVED_SLUGS } from "@/lib/slug";

export interface CreateSessionInput {
  slug?: string;
  creatorName?: string;
}

export type CreateSessionResult =
  | { slug: string; error?: undefined }
  | { slug?: undefined; error: "nome-invalido" | "slug-em-uso" };

/**
 * The creator can type a custom slug (decision #13 — matches the original
 * cuckoo.team's `/collabcafe`-style links); leaving it blank falls back to a
 * random one. A collision on a *chosen* name surfaces as a validation error
 * so the person can pick another — never a silent substitution, which would
 * be surprising given they explicitly typed a name.
 *
 * No duration input here — focus/break durations are left at the table's
 * defaults (25min/5min) and only get set once someone picks a duration in
 * the room itself (see useSessionRoom.startPhase).
 */
export async function createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
  const supabase = createServerClient();
  const base = {
    created_by_name: input.creatorName?.trim() || null,
  };

  if (input.slug) {
    const wanted = slugify(input.slug);
    if (!wanted || RESERVED_SLUGS.has(wanted)) {
      return { error: "nome-invalido" };
    }
    const { error } = await supabase.from("sessions").insert({ slug: wanted, ...base });
    if (!error) return { slug: wanted };
    if (error.code === "23505") return { error: "slug-em-uso" };
    throw error;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    if (RESERVED_SLUGS.has(slug)) continue;
    const { error } = await supabase.from("sessions").insert({ slug, ...base });
    if (!error) return { slug };
    if (error.code !== "23505") throw error;
  }
  throw new Error("Could not allocate a unique session slug");
}
