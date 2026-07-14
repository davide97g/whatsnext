import { ListingRow } from "@/components/ListingRow.tsx";
import { STATUS_META, STATUS_ORDER, type BoardColumn } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";

/**
 * The full guide, read top to bottom by stage: idea → done.
 * Each stage is a section of schedule listings; empty stages are hidden.
 */
export function RoadmapBoard({ board }: { board: BoardColumn[] }) {
  const byStatus = new Map(board.map((c) => [c.status, c]));
  const stages = STATUS_ORDER.map((s) => byStatus.get(s)).filter(
    (c): c is BoardColumn => !!c && c.items.length > 0,
  );

  if (stages.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-line-strong p-16 text-center">
        <p className="font-display text-lg text-muted">Nothing on the board yet.</p>
        <p className="eyebrow mt-2 text-faint">Check back soon</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {stages.map((stage, si) => {
        const meta = STATUS_META[stage.status];
        const onAir = stage.status === "live";
        return (
          <section key={stage.status}>
            <div
              className={cn(
                "flex items-baseline justify-between border-b-2 pb-2",
                onAir ? "border-live/50" : "border-line-strong",
              )}
            >
              <div className="flex items-baseline gap-3">
                <span className="masthead text-2xl text-faint sm:text-3xl">
                  {String(si + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2
                    className={cn(
                      "font-display text-2xl font-semibold sm:text-3xl",
                      onAir && "text-live",
                    )}
                  >
                    {meta.label}
                  </h2>
                  <span className="eyebrow text-faint">{meta.hint}</span>
                </div>
              </div>
              <span className="font-mono text-sm text-faint tabular-nums">
                {String(stage.items.length).padStart(2, "0")}
              </span>
            </div>

            <div className="divide-y divide-line">
              {stage.items.map((item, i) => (
                <ListingRow key={item.id} item={item} no={i + 1} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
