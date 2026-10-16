import { SiteHeader } from "@/components/SiteHeader";
import { NewSessionWizard } from "@/features/session/NewSessionWizard";

export default function NewSessionPage() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <NewSessionWizard />
      </div>
    </main>
  );
}
