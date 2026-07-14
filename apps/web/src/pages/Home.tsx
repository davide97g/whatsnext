import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LinksBar } from "@/components/LinksBar.tsx";
import { ListingRow } from "@/components/ListingRow.tsx";
import { NextUp } from "@/components/NextUp.tsx";
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

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
          <h1 className="masthead text-ink text-[clamp(3.5rem,13vw,10rem)]">
            What&rsquo;s next
          </h1>
          {links?.blurb && (
            <p className="mt-5 max-w-xl font-display text-xl leading-relaxed text-muted sm:text-2xl">
              {links.blurb}
            </p>
          )}

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
