import { cn } from "@/lib/utils";
import type { Phase, Status } from "@/lib/timer/state-machine";

interface LampMotifProps {
  phase: Phase;
  status: Status;
  className?: string;
}

/**
 * The app's central visual: a lamp/candle that lights up during focus and
 * dims during break — Syncpair's own motif, not a reskin of cuckoo.team's
 * bird-in-egg-timer. This is a first-pass contract (prop shape + states),
 * not the final art direction.
 *
 * Must only re-render on phase/status changes (rare, human-triggered), never
 * on the per-second countdown tick — keep the ticking mm:ss text in its own
 * leaf component subscribed to useCountdown instead.
 */
export function LampMotif({ phase, status, className }: LampMotifProps) {
  const lit = status === "running" && phase === "focus";
  const resting = status === "running" && phase === "break";
  const idle = status === "idle";

  const flameColor = lit ? "var(--flame)" : resting ? "var(--flame-dim)" : "var(--flame-dim)";
  const flameScale = lit ? 1 : resting ? 0.65 : 0.4;
  const flameOpacity = lit ? 1 : resting ? 0.8 : idle && phase === "focus" ? 0.55 : 0.35;

  return (
    <div className={cn("relative flex items-end justify-center", className)} aria-hidden>
      {/* Glow */}
      <div
        className={cn(
          "absolute bottom-[38%] h-24 w-24 rounded-full blur-2xl transition-opacity duration-700",
          lit && "animate-[flame-glow_3s_ease-in-out_infinite]",
        )}
        style={{ backgroundColor: flameColor, opacity: lit ? undefined : flameOpacity * 0.5 }}
      />

      <svg viewBox="0 0 120 160" className="relative h-48 w-36 drop-shadow-sm">
        {/* Candle body */}
        <rect x="46" y="86" width="28" height="58" rx="6" className="fill-card" stroke="var(--border)" strokeWidth="1.5" />
        <rect x="42" y="140" width="36" height="10" rx="4" className="fill-muted" />
        {/* Wick */}
        <line x1="60" y1="86" x2="60" y2="76" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" />

        {/* Flame */}
        <g
          style={{
            transformOrigin: "60px 70px",
            transform: `scale(${flameScale})`,
            opacity: flameOpacity,
            transition: "transform 900ms ease, opacity 900ms ease",
          }}
          className={lit ? "animate-[flame-flicker_2.4s_ease-in-out_infinite]" : undefined}
        >
          <path
            d="M60 40c9 12 14 21 14 30a14 14 0 1 1-28 0c0-9 5-18 14-30Z"
            fill={flameColor}
            style={{ transition: "fill 900ms ease" }}
          />
          <path
            d="M60 54c4 7 6 11 6 16a6 6 0 1 1-12 0c0-5 2-9 6-16Z"
            fill="var(--background)"
            opacity={lit ? 0.55 : 0}
            style={{ transition: "opacity 900ms ease" }}
          />
        </g>
      </svg>
    </div>
  );
}
