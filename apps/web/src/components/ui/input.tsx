import * as React from "react";
import { cn } from "@/lib/utils.ts";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-[10px] border border-line-strong bg-bg px-3 text-sm text-ink",
        "placeholder:text-faint focus:border-tally focus:outline-none focus-visible:outline-none",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2 text-sm text-ink",
      "placeholder:text-faint focus:border-tally focus:outline-none focus-visible:outline-none",
      "disabled:opacity-50 resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
