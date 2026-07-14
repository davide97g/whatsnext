import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LinksBar } from "@/components/LinksBar.tsx";
import { ListingRow } from "@/components/ListingRow.tsx";
import { NextUp } from "@/components/NextUp.tsx";
import { Button } from "@/components/ui/button.tsx";
import { api } from "@/lib/api.ts";
import { dateline } from "@/lib/format.ts";

export function Home() {
  const linksQ = useQuery({ queryKey: ["links"], queryFn: api.links });
  const nextQ = useQuery({ queryKey: ["next"], queryFn: api.next });
  const roadmapQ = useQuery({ queryKey: ["roadmap"], queryFn: () => api.roadmap() });

  const links = linksQ.data;
  const channel = links?.channelName ?? "the channel";
  const items = roadmapQ.data?.items ?? [];
  const upcoming = items.filter((i) => i.status !== "done" && i.status !== "published").slice(0, 6);
  const issue = String(items.length).padStart(3, "0");

  return (
    <div className="relative">
      {/* ── masthead / dusk signal ─────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="dusk-sky pointer-events-none absolute inset-0" aria-hidden />
        <div className="dither pointer-events-none absolute inset-x-0 bottom-0 h-48" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
          {/* dateline */}
          <div className="rise rise-1 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line-strong pb-4">
            <span className="eyebrow inline-flex items-center gap-2">
              <span className="tally-dot size-1.5 bg-tally text-tally" aria-hidden />
              Public programming guide
            </span>
            <span className="eyebrow hidden text-faint sm:inline">·</span>
            <span className="eyebrow text-faint">Updated {dateline()}</span>
            <span className="eyebrow ml-auto text-faint">No. {issue}</span>
          </div>

          {/* nameplate */}
          <h1 className="masthead rise rise-2 mt-8 text-ink text-[clamp(3.5rem,13vw,10rem)]">
            What&rsquo;s next
          </h1>
          <p className="rise rise-2 mt-5 max-w-xl font-display text-xl leading-relaxed text-muted sm:text-2xl">
            {links?.blurb ? (
              links.blurb
            ) : (
              <>Every upcoming video and live stream, from first idea to on-air.</>
            )}{" "}
            <span className="text-ink">Live from {channel}.</span>
          </p>

          {/* lead story — next up */}
          <div className="rise rise-3 mt-10">
            {nextQ.data && <NextUp next={nextQ.data} />}
          </div>

          <div className="rise rise-4 mt-7">
            <Link to="/roadmap">
              <Button variant="surface" size="lg">
                Read the full guide
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── in the pipeline ────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between border-b-2 border-line-strong pb-3">
            <div>
              <span className="eyebrow">Coming up</span>
              <h2 className="mt-1.5 font-display text-3xl font-semibold sm:text-4xl">
                In the pipeline
              </h2>
            </div>
            <Link
              to="/roadmap"
              className="eyebrow hover:text-tally whitespace-nowrap pb-1 transition-colors"
            >
              Full board →
            </Link>
          </div>

          <div className="divide-y divide-line">
            {upcoming.map((item, i) => (
              <ListingRow key={item.id} item={item} no={i + 1} />
            ))}
          </div>
        </section>
      )}

      {/* ── where to tune in ───────────────────────────────────── */}
      {links && (
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="border-b-2 border-line-strong pb-3">
            <span className="eyebrow">Where to tune in</span>
          </div>
          <div className="mt-6">
            <LinksBar links={links} />
          </div>
        </section>
      )}
    </div>
  );
}
