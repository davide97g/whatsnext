import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { LinksBar } from "@/components/LinksBar.tsx";
import { ListingRow } from "@/components/ListingRow.tsx";
import { NextUp } from "@/components/NextUp.tsx";
import { QuickLinks } from "@/components/QuickLinks.tsx";
import { Button } from "@/components/ui/button.tsx";
import { api } from "@/lib/api.ts";

export function Home() {
  const linksQ = useQuery({ queryKey: ["links"], queryFn: api.links });
  const nextQ = useQuery({ queryKey: ["next"], queryFn: api.next });
  const roadmapQ = useQuery({ queryKey: ["roadmap"], queryFn: () => api.roadmap() });

  const links = linksQ.data;
  const items = roadmapQ.data?.items ?? [];
  const upcoming = items.filter((i) => i.status !== "done" && i.status !== "published").slice(0, 6);

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="dusk-sky pointer-events-none absolute inset-0" aria-hidden />
        {/* drifting fireflies */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {[
            "left-[12%] top-[22%]",
            "left-[78%] top-[30%]",
            "left-[64%] top-[64%]",
            "left-[24%] top-[70%]",
            "left-[88%] top-[48%]",
          ].map((pos, i) => (
            <span
              key={pos}
              className={`absolute size-1.5 rounded-full bg-tally shadow-[0_0_10px_2px_var(--color-tally)] ${pos}`}
              style={{ animation: `firefly ${5 + i}s ease-in-out ${i * 0.7}s infinite` }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <a
                href={links?.youtube ?? undefined}
                target={links?.youtube ? "_blank" : undefined}
                rel="noreferrer"
                className="eyebrow group inline-flex items-center gap-2 text-live"
              >
                <Youtube className="size-4" />
                YouTube channel
              </a>
              <h1 className="masthead mt-3 leading-[0.95] text-ink text-[clamp(2.75rem,8vw,5.5rem)] [text-shadow:0_2px_24px_rgba(0,0,0,0.6),0_0_48px_rgba(246,168,33,0.25)]">
                {links?.channelName ?? "Davide Ghiotto"}
              </h1>
              {links?.blurb && (
                <p className="mt-4 max-w-xl font-sans text-lg leading-relaxed text-ink/80 sm:text-xl">
                  {links.blurb}
                </p>
              )}
            </div>
            <QuickLinks links={links} next={nextQ.data} />
          </div>

          <div className="mt-10">
            {nextQ.data && <NextUp next={nextQ.data} />}
          </div>

          <div className="mt-7">
            <Link to="/roadmap">
              <Button variant="surface" size="lg">
                All items
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between border-b-2 border-line-strong pb-3">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Up next</h2>
            <Link
              to="/roadmap"
              className="eyebrow hover:text-tally whitespace-nowrap pb-1 transition-colors"
            >
              All →
            </Link>
          </div>

          <div className="divide-y divide-line">
            {upcoming.map((item, i) => (
              <ListingRow key={item.id} item={item} no={i + 1} />
            ))}
          </div>
        </section>
      )}

      {links && (
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <LinksBar links={links} />
        </section>
      )}
    </div>
  );
}
