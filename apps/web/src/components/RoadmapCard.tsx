import { ArrowUpRight, CalendarClock } from "lucide-react";
import { TypeBadge } from "@/components/ItemChrome.tsx";
import { Card } from "@/components/ui/card.tsx";
import { scheduleStamp } from "@/lib/format.ts";
import type { RoadmapItem } from "@/lib/types.ts";

export function RoadmapCard({ item }: { item: RoadmapItem }) {
  const stamp = scheduleStamp(item.scheduledAt ?? item.publishedAt);
  const href = item.youtubeUrl ?? undefined;
  const Wrapper = href ? "a" : "div";

  return (
    <Card className="group overflow-hidden hover:border-line-strong">
      <Wrapper
        {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
        className="block"
      >
        {item.thumbnailUrl ? (
          <div className="relative aspect-video overflow-hidden border-b border-line">
            <img
              src={item.thumbnailUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center border-b border-line bg-surface-2">
            <CalendarClock className="size-6 text-faint" />
          </div>
        )}

        <div className="flex flex-col gap-2.5 p-3.5">
          <div className="flex items-center justify-between">
            <TypeBadge type={item.type} />
            {href && (
              <ArrowUpRight className="size-4 text-faint transition-colors group-hover:text-tally" />
            )}
          </div>

          <h3 className="font-display text-sm font-medium leading-snug text-ink">{item.title}</h3>

          {stamp && (
            <div className="font-mono text-[0.7rem] uppercase tracking-wider text-muted">{stamp}</div>
          )}

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {item.tags.map((t) => (
                <span key={t} className="text-[0.68rem] text-faint">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Wrapper>
    </Card>
  );
}
