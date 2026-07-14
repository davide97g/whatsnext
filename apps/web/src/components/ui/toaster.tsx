import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-line-strong)",
          color: "var(--color-ink)",
          fontFamily: "var(--font-sans)",
        },
      }}
    />
  );
}
