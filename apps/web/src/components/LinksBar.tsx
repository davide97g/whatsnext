import { ArrowUpRight, Github, Linkedin, MessageSquare, Youtube, type LucideIcon } from "lucide-react";
import type { LinksResponse } from "@/lib/types.ts";
import { cn } from "@/lib/utils.ts";

interface Channel {
  key: keyof Omit<LinksResponse, "channelName" | "blurb">;
  label: string;
  action: string;
  icon: LucideIcon;
  hover: string;
}

const CHANNELS: Channel[] = [
  { key: "youtube", label: "YouTube", action: "Subscribe", icon: Youtube, hover: "group-hover:text-live" },
  { key: "discord", label: "Discord", action: "Join the server", icon: MessageSquare, hover: "group-hover:text-tally" },
  { key: "github", label: "GitHub", action: "Browse the code", icon: Github, hover: "group-hover:text-ink" },
  { key: "linkedin", label: "LinkedIn", action: "Connect", icon: Linkedin, hover: "group-hover:text-tally" },
];

export function LinksBar({ links }: { links: LinksResponse }) {
  const available = CHANNELS.filter((c) => links[c.key]);
  if (available.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {available.map((c) => {
        const Icon = c.icon;
        return (
          <a
            key={c.key}
            href={links[c.key]!}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col justify-between gap-8 rounded-[var(--radius)] border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-surface-2"
          >
            <div className="flex items-start justify-between">
              <Icon className={cn("size-6 text-muted transition-colors", c.hover)} />
              <ArrowUpRight className="size-4 text-faint transition-colors group-hover:text-ink" />
            </div>
            <div>
              <div className="font-display text-base font-medium text-ink">{c.label}</div>
              <div className="font-mono text-[0.62rem] uppercase tracking-widest text-faint">
                {c.action}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
