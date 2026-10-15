import { CreateSessionForm } from "@/features/session/CreateSessionForm";

export default function NewSessionPage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-center py-6">
        <span className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Syncpair
        </span>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
        <h1 className="text-2xl font-semibold text-foreground">Criar uma sessão compartilhada</h1>
        <CreateSessionForm />
      </div>
    </main>
  );
}
