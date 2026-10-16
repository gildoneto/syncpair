import { cn } from "@/lib/utils";

interface UserBadgeProps {
  name: string;
  size?: "sm" | "md";
  onClick?: () => void;
}

const SIZE = {
  sm: { circle: "size-9 text-xs", label: "text-xs" },
  md: { circle: "size-12 text-sm", label: "text-sm" },
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Circle of initials + name below — cuckoo.team's participant look.
 * `onClick` makes it a button (e.g. to edit your own name); omit it for a
 * read-only badge (e.g. another participant in a session).
 */
export function UserBadge({ name, size = "md", onClick }: UserBadgeProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-bold text-primary",
          SIZE[size].circle,
        )}
      >
        {getInitials(name)}
      </span>
      <span className={cn("max-w-20 truncate text-muted-foreground", SIZE[size].label)}>{name}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5">
        {content}
      </button>
    );
  }

  return <div className="flex flex-col items-center gap-1.5">{content}</div>;
}
