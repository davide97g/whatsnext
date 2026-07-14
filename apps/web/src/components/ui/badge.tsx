import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils.ts";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider",
  {
    variants: {
      tone: {
        neutral: "border-line-strong bg-surface-2 text-muted",
        tally: "border-tally/40 bg-tally/10 text-tally",
        live: "border-live/50 bg-live/10 text-live",
        go: "border-go/40 bg-go/10 text-go",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
