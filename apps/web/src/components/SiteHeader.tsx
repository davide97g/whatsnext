import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils.ts";

const NAV = [
  { to: "/", label: "Guide" },
  { to: "/roadmap", label: "Board" },
];

export function SiteHeader({ discordUrl }: { discordUrl?: string | null }) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-line-strong bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="tally-dot size-2 bg-tally text-tally" aria-hidden />
          <span className="masthead text-xl leading-none text-ink">
            whats<span className="text-tally">next</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-[var(--radius)] px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] transition-colors",
                  active ? "text-tally" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {discordUrl && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 rounded-[var(--radius)] border border-line-strong px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-tally/60 hover:text-tally"
            >
              Discord
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
