import { ArrowUpRight, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ListingRow } from "@/components/ListingRow.tsx";
import { addDays, isSameDay, minutesOfDay } from "@/lib/format.ts";
import type { RoadmapItem } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";

/* Layout constants — one hour of the guide is HOUR px tall. */
const HOUR = 64;
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 22;
const BLOCK_MIN = 55; // assumed slot length (we have no explicit duration)
const MIN_CARD_PX = 76; // keep time + title legible even for short slots

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/** The scheduling instant for an item (falls back to publish time). */
const whenOf = (it: RoadmapItem): string | null => it.scheduledAt ?? it.publishedAt;

interface Placed {
  item: RoadmapItem;
  start: number; // minutes from midnight
  end: number;
  col: number;
  cols: number;
}

/** Assign overlapping same-day items to side-by-side columns (per cluster). */
function packDay(items: RoadmapItem[]): Placed[] {
  const evs = items
    .map((item) => {
      const start = minutesOfDay(whenOf(item)!);
      return { item, start, end: start + BLOCK_MIN, col: 0, cols: 1 };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const out: Placed[] = [];
  let cluster: Placed[] = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    if (cluster.length === 0) return;
    const colEnds: number[] = [];
    for (const e of cluster) {
      let c = colEnds.findIndex((end) => e.start >= end);
      if (c === -1) {
        c = colEnds.length;
        colEnds.push(e.end);
      } else {
        colEnds[c] = e.end;
      }
      e.col = c;
    }
    const cols = colEnds.length;
    for (const e of cluster) {
      e.cols = cols;
      out.push(e);
    }
    cluster = [];
  };

  for (const e of evs) {
    if (cluster.length > 0 && e.start >= clusterEnd) flush();
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, e.end);
  }
  flush();
  return out;
}

function EventCard({ p, startHour }: { p: Placed; startHour: number }) {
  const { item } = p;
  const isLive = item.type === "live";
  const onAir = item.status === "live";
  const href = item.youtubeUrl ?? undefined;
  const Wrapper = href ? "a" : "div";
  const time = new Date(whenOf(item)!).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const top = ((p.start - startHour * 60) / 60) * HOUR;
  const height = Math.max((p.end - p.start) / 60 * HOUR, MIN_CARD_PX);
  const gap = 3;

  return (
    <Wrapper
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
      style={{
        top,
        height: height - gap,
        left: `calc(${(p.col / p.cols) * 100}% + 2px)`,
        width: `calc(${100 / p.cols}% - 4px)`,
      }}
      className={cn(
        "group absolute flex flex-col gap-1 overflow-hidden rounded-[calc(var(--radius)-4px)] border p-2",
        "card-soft bg-surface transition-all hover:-translate-y-0.5",
        isLive
          ? "border-live/40 border-l-2 border-l-live hover:border-live/70"
          : "border-line-strong border-l-2 border-l-tally/60 hover:border-tally/60",
        href && "cursor-pointer",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 font-mono text-[0.62rem] tabular-nums",
            isLive ? "text-live" : "text-tally",
          )}
        >
          {isLive && <Radio className="size-2.5" />}
          {time}
        </span>
        {onAir ? (
          <span className="tally-dot size-1.5 shrink-0 bg-live text-live" aria-hidden />
        ) : (
          href && (
            <ArrowUpRight className="size-3 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
          )
        )}
      </div>
      <h4
        className={cn(
          "line-clamp-2 font-display text-[0.82rem] font-medium leading-tight text-ink transition-colors",
          href && (isLive ? "group-hover:text-live" : "group-hover:text-tally"),
        )}
      >
        {item.title}
      </h4>
      {onAir && (
        <span className="mt-auto font-mono text-[0.56rem] uppercase tracking-[0.18em] text-live">
          On air now
        </span>
      )}
    </Wrapper>
  );
}

export function WeekSchedule({
  items,
  weekStart,
}: {
  items: RoadmapItem[];
  weekStart: Date;
}) {
  // Re-render each minute so the "now" line tracks real time.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Only dated items that fall inside the visible week.
  const inWeek = useMemo(() => {
    const end = addDays(weekStart, 7).getTime();
    const start = weekStart.getTime();
    return items.filter((it) => {
      const w = whenOf(it);
      if (!w) return false;
      const t = new Date(w).getTime();
      return t >= start && t < end;
    });
  }, [items, weekStart]);

  const byDay = useMemo(() => {
    const buckets: RoadmapItem[][] = [[], [], [], [], [], [], []];
    for (const it of inWeek) {
      const d = new Date(whenOf(it)!);
      const idx = (d.getDay() + 6) % 7;
      buckets[idx].push(it);
    }
    return buckets;
  }, [inWeek]);

  // Vertical range: default 08–22, expanded to contain every dated item.
  const [startHour, endHour] = useMemo(() => {
    let lo = DEFAULT_START_HOUR;
    let hi = DEFAULT_END_HOUR;
    for (const it of inWeek) {
      const m = minutesOfDay(whenOf(it)!);
      lo = Math.min(lo, Math.floor(m / 60));
      hi = Math.max(hi, Math.ceil((m + BLOCK_MIN) / 60));
    }
    return [lo, Math.max(hi, lo + 1)];
  }, [inWeek]);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const bodyH = (endHour - startHour) * HOUR;

  const todayIdx = days.findIndex((d) => isSameDay(d, now));
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowVisible = todayIdx >= 0 && nowMin >= startHour * 60 && nowMin <= endHour * 60;
  const nowTop = ((nowMin - startHour * 60) / 60) * HOUR;

  return (
    <div>
      {/* ── Desktop: TV-guide grid ─────────────────────────────── */}
      <div className="thin-scroll hidden overflow-x-auto sm:block">
        <div className="min-w-[52rem]">
          {/* day header */}
          <div className="grid grid-cols-[3.25rem_repeat(7,1fr)] border-b-2 border-line-strong">
            <div className="border-r border-line" />
            {days.map((d, i) => {
              const today = isSameDay(d, now);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col items-center gap-0.5 border-r border-line py-2.5",
                    today && "bg-surface-2",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[0.6rem] uppercase tracking-[0.2em]",
                      today ? "text-tally" : "text-faint",
                    )}
                  >
                    {WEEKDAYS[i]}
                  </span>
                  <span
                    className={cn(
                      "masthead text-xl tabular-nums",
                      today ? "text-tally" : "text-muted",
                    )}
                  >
                    {String(d.getDate()).padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>

          {/* grid body */}
          <div className="relative grid grid-cols-[3.25rem_repeat(7,1fr)]">
            {/* hour gutter */}
            <div className="border-r border-line">
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR }}
                  className="relative border-b border-line/60"
                >
                  <span className="absolute -top-2 right-1.5 font-mono text-[0.6rem] tabular-nums text-faint">
                    {String(h).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>

            {/* day columns */}
            {byDay.map((dayItems, i) => {
              const today = isSameDay(days[i], now);
              return (
                <div
                  key={i}
                  className={cn("relative border-r border-line", today && "bg-surface-2/40")}
                  style={{
                    height: bodyH,
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, var(--color-line) 0 1px, transparent 1px " +
                      HOUR +
                      "px)",
                  }}
                >
                  {packDay(dayItems).map((p) => (
                    <EventCard key={p.item.id} p={p} startHour={startHour} />
                  ))}
                </div>
              );
            })}

            {/* now line — spans every day column */}
            {nowVisible && (
              <div
                className="pointer-events-none absolute left-[3.25rem] right-0 z-10 flex items-center"
                style={{ top: nowTop }}
                aria-hidden
              >
                <span className="tally-dot -ml-1 size-2 shrink-0 bg-tally text-tally" />
                <span className="h-px flex-1 border-t border-dashed border-tally/60" />
              </div>
            )}

            {inWeek.length === 0 && (
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                <p className="font-display text-lg text-muted">Nothing scheduled this week.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile: agenda grouped by day ──────────────────────── */}
      <div className="sm:hidden">
        {inWeek.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-dashed border-line-strong p-12 text-center">
            <p className="font-display text-lg text-muted">Nothing scheduled this week.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {days.map((d, i) => {
              const dayItems = [...byDay[i]].sort(
                (a, b) => minutesOfDay(whenOf(a)!) - minutesOfDay(whenOf(b)!),
              );
              if (dayItems.length === 0) return null;
              const today = isSameDay(d, now);
              return (
                <section key={i}>
                  <div
                    className={cn(
                      "flex items-baseline gap-3 border-b pb-2",
                      today ? "border-tally/50" : "border-line-strong",
                    )}
                  >
                    <span className={cn("masthead text-xl", today ? "text-tally" : "text-muted")}>
                      {String(d.getDate()).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[0.62rem] uppercase tracking-[0.2em]",
                        today ? "text-tally" : "text-faint",
                      )}
                    >
                      {WEEKDAYS[i]}
                      {today && " · today"}
                    </span>
                  </div>
                  <div className="divide-y divide-line">
                    {dayItems.map((item, n) => (
                      <ListingRow key={item.id} item={item} no={n + 1} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
