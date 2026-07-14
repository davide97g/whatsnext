import { Radio, Video } from "lucide-react";
import { Countdown } from "@/components/Countdown.tsx";
import { fullDate } from "@/lib/format.ts";
import type { NextResponse, RoadmapItem } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";

function LeadEntry({ kind, item }: { kind: "video" | "live"; item: RoadmapItem | null }) {
  const isLive = kind === "live";
  const Icon = isLive ? Radio : Video;
  const label = isLive ? "Next live" : "Next video";

  return (
    <div className="flex min-h-[190px] flex-col justify-between gap-6 p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="eyebrow inline-flex items-center gap-2">
          <Icon className={cn("size-3.5", isLive ? "text-live" : "text-tally")} />
          {label}
        </span>
        {item && (
          <span
            className={cn(
              "tally-dot size-2",
              isLive ? "bg-live text-live" : "bg-tally text-tally",
            )}
            aria-hidden
          />
        )}
      </div>

      {item ? (
        <div>
          <Countdown
            target={item.scheduledAt}
            live={isLive}
            className="text-[2.6rem] font-bold leading-none sm:text-6xl"
          />
          <div className="mt-4 border-t border-line pt-3">
            <div className="line-clamp-2 font-display text-lg font-medium leading-snug text-ink">
              {item.title}
            </div>
            <div className="mt-1 font-mono text-[0.68rem] uppercase tracking-widest text-faint">
              {fullDate(item.scheduledAt)}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <span className="font-mono text-4xl text-faint tabular-nums sm:text-5xl">--:--:--</span>
          <div className="mt-4 border-t border-line pt-3">
            <div className="font-display text-lg text-muted">Nothing on the wire yet</div>
            <div className="mt-1 font-mono text-[0.68rem] uppercase tracking-widest text-faint">
              No {isLive ? "live stream" : "video"} scheduled
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function NextUp({ next }: { next: NextResponse }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-line-strong bg-bg/55 backdrop-blur-sm">
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <LeadEntry kind="video" item={next.video} />
        <LeadEntry kind="live" item={next.live} />
      </div>
    </div>
  );
}
