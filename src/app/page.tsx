import Link from "next/link";
import { SoloTimer } from "@/features/solo-timer/SoloTimer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-center gap-4 py-6">
        <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          Syncpair
        </span>
      </header>
      <SoloTimer />
      <footer className="flex items-center justify-center pb-10">
        <Link href="/new" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          Create a shared session →
        </Link>
      </footer>
    </main>
  );
}
