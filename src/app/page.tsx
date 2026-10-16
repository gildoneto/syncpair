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
    </main>
  );
}
