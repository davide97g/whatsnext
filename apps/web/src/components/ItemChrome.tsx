import { Radio, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { STATUS_META, type ItemStatus, type ItemType } from "@/lib/types.ts";

export function TypeBadge({ type }: { type: ItemType }) {
  return type === "live" ? (
    <Badge tone="live">
      <Radio className="size-3" /> Live
    </Badge>
  ) : (
    <Badge tone="neutral">
      <Video className="size-3" /> Video
    </Badge>
  );
}

const STATUS_TONE: Record<ItemStatus, "neutral" | "tally" | "live" | "go"> = {
  idea: "neutral",
  planned: "tally",
  in_progress: "tally",
  scheduled: "tally",
  live: "live",
  published: "go",
  done: "go",
};

export function StatusPill({ status }: { status: ItemStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_META[status].label}</Badge>;
}
