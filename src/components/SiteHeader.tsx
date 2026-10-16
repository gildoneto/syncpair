import { MyIdentityBadge } from "@/components/MyIdentityBadge";

export function SiteHeader() {
  return (
    <header className="relative flex items-center justify-center py-6">
      <span className="text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
        Syncpair
      </span>
      <div className="absolute top-1/2 right-6 -translate-y-1/2">
        <MyIdentityBadge />
      </div>
    </header>
  );
}
