import { NewSessionWizard } from "@/features/session/NewSessionWizard";

export default function NewSessionPage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-center py-6">
        <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">Syncpair</span>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <NewSessionWizard />
      </div>
    </main>
  );
}
