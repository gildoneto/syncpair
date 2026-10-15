"use server";

import { createServerClient } from "@/lib/supabase/server";
import { generateSlug, slugify, RESERVED_SLUGS } from "@/lib/slug";

export interface CreateSessionInput {
  slug?: string;
  creatorName?: string;
  focusMinutes: number;
  breakMinutes: number;
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
 */
export async function createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
  const supabase = createServerClient();
  const base = {
    created_by_name: input.creatorName?.trim() || null,
    focus_duration_seconds: Math.round(input.focusMinutes * 60),
    break_duration_seconds: Math.round(input.breakMinutes * 60),
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
