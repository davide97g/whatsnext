import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-mono uppercase tracking-[0.14em] transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-tally text-bg hover:bg-tally/90 shadow-[0_0_0_rgba(246,168,33,0)] hover:shadow-[0_0_28px_-4px_var(--color-tally)]",
        surface: "bg-surface-2 text-ink border border-line-strong hover:border-tally/60 hover:text-tally",
        ghost: "text-muted hover:text-ink hover:bg-surface-2",
        danger: "bg-transparent text-live border border-live/40 hover:bg-live/10",
        live: "bg-live text-white hover:bg-live/90 hover:shadow-[0_0_28px_-4px_var(--color-live)]",
      },
      size: {
        sm: "h-8 px-3 text-[0.68rem]",
        md: "h-10 px-4 text-xs",
        lg: "h-12 px-7 text-[0.8rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
