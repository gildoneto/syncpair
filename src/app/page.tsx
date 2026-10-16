import { SiteHeader } from "@/components/SiteHeader";
import { SoloTimer } from "@/features/solo-timer/SoloTimer";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <SoloTimer />
    </main>
  );
}
