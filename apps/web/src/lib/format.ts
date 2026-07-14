/** Formats an ISO date as a compact schedule stamp, e.g. "AUG 01 · 15:00". */
export function scheduleStamp(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const time = d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${month} ${day} · ${time}`;
}

export function fullDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Masthead dateline, e.g. "14 JUL 2026". */
export function dateline(iso?: string | number | Date): string {
  const d = iso ? new Date(iso) : new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return `${day} ${month} ${d.getFullYear()}`;
}

/** Split schedule stamp for a two-line listing time column. */
export function listingWhen(iso: string | null): { day: string; time: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  const wd = d.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const time = d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return { day: `${wd} ${day} ${month}`, time };
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalMs: number;
}

export function countdownTo(iso: string | null, now: number = Date.now()): Countdown | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  const diff = target - now;
  const totalMs = Math.abs(diff);
  const days = Math.floor(totalMs / 86_400_000);
  const hours = Math.floor((totalMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  return { days, hours, minutes, seconds, isPast: diff < 0, totalMs };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "03d 14:22:09" style clock; drops the day segment when < 1 day out. */
export function formatCountdown(c: Countdown): string {
  const clock = `${pad(c.hours)}:${pad(c.minutes)}:${pad(c.seconds)}`;
  return c.days > 0 ? `${pad(c.days)}d ${clock}` : clock;
}
