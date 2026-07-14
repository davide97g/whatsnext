import { ArrowUpRight, Radio, Video, Youtube, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { itemTarget, type LinksResponse, type NextResponse } from "@/lib/types.ts";

function QuickLink({
  href,
  external,
  variant,
  icon: Icon,
  children,
}: {
  href: string;
  external: boolean;
  variant: "live" | "surface";
  icon: LucideIcon;
  children: ReactNode;
}) {
  const inner = (
    <Button variant={variant} size="md">
      <Icon />
      {children}
      {external && <ArrowUpRight />}
    </Button>
  );

  return external ? (
    <a href={href} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <Link to={href}>{inner}</Link>
  );
}

/** Quick access to the channel and the next live/video — YouTube when linked, board otherwise. */
export function QuickLinks({ links, next }: { links?: LinksResponse; next?: NextResponse }) {
  const live = next?.live ? itemTarget(next.live) : null;
  const video = next?.video ? itemTarget(next.video) : null;

  if (!links?.youtube && !live && !video) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links?.youtube && (
        <QuickLink href={links.youtube} external variant="live" icon={Youtube}>
          YouTube
        </QuickLink>
      )}
      {live && (
        <QuickLink href={live.href} external={live.external} variant="surface" icon={Radio}>
          Live
        </QuickLink>
      )}
      {video && (
        <QuickLink href={video.href} external={video.external} variant="surface" icon={Video}>
          Video
        </QuickLink>
      )}
    </div>
  );
}
