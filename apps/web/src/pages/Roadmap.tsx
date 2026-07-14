import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { RoadmapBoard } from "@/components/RoadmapBoard.tsx";
import { WeekSchedule } from "@/components/WeekSchedule.tsx";
import { api } from "@/lib/api.ts";
import { addDays, dateline, startOfWeek, weekRangeLabel } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

type Filter = "all" | "video" | "live";
type View = "board" | "week";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "video", label: "Videos" },
  { value: "live", label: "Live" },
];

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Board" },
  { value: "week", label: "Week" },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex shrink-0 rounded-[var(--radius)] border border-line-strong bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-[2px] px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] transition-colors",
            value === o.value ? "bg-surface-2 text-tally" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Roadmap() {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("board");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["roadmap", filter],
    queryFn: () => api.roadmap(filter === "all" ? undefined : filter),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line-strong pb-4">
        <span className="eyebrow">The full guide</span>
        <span className="eyebrow ml-auto text-faint">Updated {dateline()}</span>
      </div>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="masthead text-[clamp(2.75rem,9vw,6rem)] text-ink">The board</h1>
          <p className="mt-4 max-w-lg font-display text-lg leading-relaxed text-muted">
            {view === "board" ? (
              <>
                Every video and stream, from first idea to published. Read top to bottom — each
                stage is one step closer to on-air.
              </>
            ) : (
              <>The week&rsquo;s schedule, laid out like a programming guide. Scheduled slots only.</>
            )}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Segmented options={VIEWS} value={view} onChange={setView} />
          <Segmented options={FILTERS} value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* week navigator — only in week view */}
      {view === "week" && (
        <div className="mt-10 flex items-center justify-between border-b border-line-strong pb-3">
          <span className="masthead text-2xl text-ink sm:text-3xl">
            {weekRangeLabel(weekStart)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className="grid size-9 place-items-center rounded-[var(--radius)] border border-line-strong text-muted transition-colors hover:border-tally/60 hover:text-tally"
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="rounded-[var(--radius)] border border-line-strong px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted transition-colors hover:border-tally/60 hover:text-tally"
            >
              This week
            </button>
            <button
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className="grid size-9 place-items-center rounded-[var(--radius)] border border-line-strong text-muted transition-colors hover:border-tally/60 hover:text-tally"
              aria-label="Next week"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className={view === "week" ? "mt-6" : "mt-12"}>
        {isLoading && <p className="eyebrow text-muted">Loading the guide…</p>}
        {isError && (
          <p className="font-display text-lg text-live">
            Couldn&rsquo;t load the guide. Try refreshing the page.
          </p>
        )}
        {data &&
          (view === "board" ? (
            <RoadmapBoard board={data.board} />
          ) : (
            <WeekSchedule items={data.items} weekStart={weekStart} />
          ))}
      </div>
    </div>
  );
}
