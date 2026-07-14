import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RoadmapBoard } from "@/components/RoadmapBoard.tsx";
import { api } from "@/lib/api.ts";
import { dateline } from "@/lib/format.ts";
import { cn } from "@/lib/utils.ts";

type Filter = "all" | "video" | "live";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "video", label: "Videos" },
  { value: "live", label: "Live" },
];

export function Roadmap() {
  const [filter, setFilter] = useState<Filter>("all");
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
            Every video and stream, from first idea to published. Read top to bottom — each stage is
            one step closer to on-air.
          </p>
        </div>

        <div className="inline-flex shrink-0 rounded-[var(--radius)] border border-line-strong bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-[2px] px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] transition-colors",
                filter === f.value ? "bg-surface-2 text-tally" : "text-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12">
        {isLoading && <p className="eyebrow text-muted">Loading the guide…</p>}
        {isError && (
          <p className="font-display text-lg text-live">
            Couldn&rsquo;t load the guide. Try refreshing the page.
          </p>
        )}
        {data && <RoadmapBoard board={data.board} />}
      </div>
    </div>
  );
}
