import * as React from "react";
import { cn } from "@/lib/utils.ts";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "card-soft rounded-[var(--radius)] border border-line bg-surface transition-all",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
