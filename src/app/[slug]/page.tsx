import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { NameGate } from "@/features/session/NameGate";
import type { SessionRow } from "@/types/session";

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data } = await supabase.from("sessions").select("*").eq("slug", slug).maybeSingle();
  const row = data as SessionRow | null;

  if (!row) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">This session doesn&apos;t exist</h1>
        <p className="max-w-sm text-muted-foreground">
          The link might be wrong, or the session expired from inactivity.
        </p>
        <Link href="/new" className="text-sm text-primary underline-offset-4 hover:underline">
          Create a new session
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-center py-6">
        <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          Syncpair
        </span>
      </header>
      <NameGate slug={slug} initial={row} />
    </main>
  );
}
