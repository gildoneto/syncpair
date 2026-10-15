import { customAlphabet } from "nanoid";

export const RESERVED_SLUGS = new Set(["new", "api", "_next", "favicon.ico"]);

// No 0/O/1/l/i — avoids ambiguous-looking fallback slugs in a shared link.
export const generateSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 32);
}
