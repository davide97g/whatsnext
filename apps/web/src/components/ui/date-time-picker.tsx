import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils.ts";

/**
 * Styled date + time picker. Value is a `datetime-local`-format local string
 * (`YYYY-MM-DDTHH:mm`) or `""`, so it is a drop-in for `<input type="datetime-local">`.
 */
interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Minute granularity for the time dropdown. */
  minuteStep?: number;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** Local Date → `YYYY-MM-DDTHH:mm`. */
function toLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse a `datetime-local` string to a Date (local), or null. */
function parse(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DateTimePicker({ id, value, onChange, minuteStep = 5 }: Props) {
  const selected = parse(value);
  const [open, setOpen] = React.useState(false);
  // Month currently shown in the calendar grid.
  const [view, setView] = React.useState(() => selected ?? new Date());
  // Working time; kept even before a day is chosen.
  const [hour, setHour] = React.useState(() => selected?.getHours() ?? 12);
  const [minute, setMinute] = React.useState(() => selected?.getMinutes() ?? 0);

  // Re-sync internal state whenever the popover (re)opens or the value changes.
  React.useEffect(() => {
    if (!open) return;
    const s = parse(value);
    setView(s ?? new Date());
    if (s) {
      setHour(s.getHours());
      setMinute(s.getMinutes());
    }
  }, [open, value]);

  const today = new Date();
  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset for the 1st of the month.
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const emit = (day: number, h: number, m: number) => onChange(toLocalValue(new Date(year, month, day, h, m)));

  const pickDay = (day: number) => emit(day, hour, minute);

  const changeTime = (h: number, m: number) => {
    setHour(h);
    setMinute(m);
    // Only re-emit if a day is already chosen.
    if (selected) onChange(toLocalValue(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), h, m)));
  };

  const shiftMonth = (delta: number) => setView(new Date(year, month + delta, 1));

  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const label = selected
    ? selected.toLocaleString(undefined, {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "Pick a date & time";

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-[10px] border border-line-strong bg-bg px-3 text-left text-sm",
            "focus:border-tally focus:outline-none",
            selected ? "text-ink" : "text-faint",
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted" />
            {label}
          </span>
          {selected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear"
              className="rounded p-0.5 text-muted hover:text-ink"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              <X className="size-3.5" />
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[19rem] rounded-[12px] border border-line-strong bg-surface-2 p-3 shadow-xl"
        >
          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="rounded-[8px] p-1.5 text-muted hover:bg-tally/15 hover:text-tally"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-display text-sm font-semibold text-ink">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              className="rounded-[8px] p-1.5 text-muted hover:bg-tally/15 hover:text-tally"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-center font-mono text-[0.6rem] uppercase tracking-wider text-faint">
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const cellDate = new Date(year, month, day);
              const isSelected = selected != null && sameDay(cellDate, selected);
              const isToday = sameDay(cellDate, today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-[8px] text-sm transition-colors",
                    isSelected
                      ? "bg-tally font-semibold text-bg"
                      : "text-ink hover:bg-tally/15 hover:text-tally",
                    !isSelected && isToday && "ring-1 ring-inset ring-tally/50",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time row */}
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <Clock className="size-4 text-muted" />
            <TimeSelect value={hour} options={hours} onChange={(h) => changeTime(h, minute)} ariaLabel="Hour" />
            <span className="text-muted">:</span>
            <TimeSelect value={minute} options={minutes} onChange={(m) => changeTime(hour, m)} ariaLabel="Minute" />
            <button
              type="button"
              className="ml-auto rounded-[8px] px-2.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted hover:bg-surface hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/** Native select styled to match the theme — used for hour/minute. */
function TimeSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: number;
  options: number[];
  onChange: (n: number) => void;
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        "h-9 rounded-[8px] border border-line-strong bg-bg px-2 text-sm text-ink tabular-nums",
        "focus:border-tally focus:outline-none",
      )}
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {pad(n)}
        </option>
      ))}
    </select>
  );
}
