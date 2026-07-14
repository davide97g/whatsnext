import { ArrowUpRight, Radio } from "lucide-react";
import { listingWhen } from "@/lib/format.ts";
import type { RoadmapItem } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";

/**
 * A single line in the programming guide: number · timecode · serif title · signal.
 * This is the page's signature — a broadcast schedule listing, not a card.
 */
export function ListingRow({ item, no }: { item: RoadmapItem; no: number }) {
  const when = listingWhen(item.scheduledAt ?? item.publishedAt);
  const isLive = item.type === "live";
  const href = item.youtubeUrl ?? undefined;
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "group relative grid grid-cols-[2.2rem_1fr] items-start gap-x-4 gap-y-2 py-4",
        "sm:grid-cols-[2.6rem_8.5rem_1fr_auto] sm:items-center sm:gap-x-5",
        "transition-colors",
        href && "hover:bg-surface/60",
      )}
    >
      {/* running number */}
      <span className="pt-0.5 font-mono text-xs text-faint tabular-nums sm:pt-0">
        {String(no).padStart(2, "0")}
      </span>

      {/* timecode column */}
      <div className="col-start-2 row-start-1 hidden flex-col leading-tight sm:flex">
        {when ? (
          <>
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                isLive ? "text-live" : "text-tally",
              )}
            >
              {when.time}
            </span>
            <span className="font-mono text-[0.62rem] uppercase tracking-widest text-faint">
              {when.day}
            </span>
          </>
        ) : (
          <span className="font-mono text-sm text-faint">— · —</span>
        )}
      </div>

      {/* title + meta */}
      <div className="col-start-2 row-start-1 min-w-0 sm:col-start-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.2em]",
              isLive ? "text-live" : "text-muted",
            )}
          >
            {isLive && <Radio className="size-3" />}
            {isLive ? "Live" : "Video"}
          </span>
          {/* schedule stamp inline on mobile */}
          {when && (
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-faint sm:hidden">
              · {when.day} {when.time}
            </span>
          )}
        </div>
        <h3
          className={cn(
            "mt-1 font-display text-lg font-medium leading-snug text-ink transition-colors sm:text-xl",
            href && "group-hover:text-tally",
          )}
        >
          {item.title}
        </h3>
        {item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {item.tags.map((t) => (
              <span key={t} className="font-mono text-[0.62rem] uppercase tracking-wider text-faint">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* thumbnail — a small broadcast still, screened until hover */}
      {item.thumbnailUrl && (
        <div className="col-start-2 row-start-2 mt-1 w-full max-w-[13rem] overflow-hidden rounded-[calc(var(--radius)-4px)] border border-line sm:col-start-4 sm:row-start-1 sm:mt-0 sm:w-40">
          <div className="relative aspect-video">
            <img
              src={item.thumbnailUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div
              className="thumb-screen pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-0"
              aria-hidden
            />
          </div>
        </div>
      )}

      {href && (
        <ArrowUpRight className="absolute right-0 top-4 size-4 text-faint opacity-0 transition-opacity group-hover:opacity-100 sm:hidden" />
      )}
    </Wrapper>
  );
}
