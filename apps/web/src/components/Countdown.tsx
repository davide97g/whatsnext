import { useEffect, useState } from "react";
import { countdownTo, formatCountdown } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

interface CountdownProps {
  target: string | null;
  className?: string;
  /** When true, styling shifts to the live/red treatment. */
  live?: boolean;
}

/** Ticking monospace clock — the channel's "time to air". */
export function Countdown({ target, className, live }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const c = countdownTo(target, now);
  if (!c) return null;

  if (c.isPast) {
    return (
      <span className={cn("font-mono tabular-nums text-live", className)}>
        {live ? "ON AIR" : "just aired"}
      </span>
    );
  }

  return (
    <span
      className={cn("font-mono tabular-nums", live ? "text-live" : "text-tally", className)}
      aria-label={`Time remaining: ${formatCountdown(c)}`}
    >
      {formatCountdown(c)}
    </span>
  );
}
