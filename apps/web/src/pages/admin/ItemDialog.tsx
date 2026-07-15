import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { DateTimePicker } from "@/components/ui/date-time-picker.tsx";
import { Input, Textarea } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { api } from "@/lib/api.ts";
import { STATUS_META, STATUS_ORDER, type ItemStatus, type ItemType, type RoadmapItem } from "@/lib/types.ts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this item; otherwise it creates a new one. */
  item?: RoadmapItem | null;
}

interface FormState {
  title: string;
  type: ItemType;
  status: ItemStatus;
  description: string;
  scheduledAt: string; // datetime-local value
  youtubeUrl: string;
  thumbnailUrl: string;
  tags: string;
}

const EMPTY: FormState = {
  title: "",
  type: "video",
  status: "planned",
  description: "",
  scheduledAt: "",
  youtubeUrl: "",
  thumbnailUrl: "",
  tags: "",
};

/** ISO → value for <input type="datetime-local"> in the viewer's local time. */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function fromItem(item?: RoadmapItem | null): FormState {
  if (!item) return EMPTY;
  return {
    title: item.title,
    type: item.type,
    status: item.status,
    description: item.description ?? "",
    scheduledAt: isoToLocalInput(item.scheduledAt),
    youtubeUrl: item.youtubeUrl ?? "",
    thumbnailUrl: item.thumbnailUrl ?? "",
    tags: item.tags.join(", "),
  };
}

export function ItemDialog({ open, onOpenChange, item }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(fromItem(item));

  useEffect(() => {
    if (open) setForm(fromItem(item));
  }, [open, item]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: () => {
      const payload: Partial<RoadmapItem> = {
        title: form.title.trim(),
        type: form.type,
        status: form.status,
        description: form.description.trim() || null,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
        youtubeUrl: form.youtubeUrl.trim() || null,
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      return item ? api.update(item.id, payload) : api.create(payload);
    },
    onSuccess: () => {
      toast.success(item ? "Changes saved" : "Item added to the board");
      qc.invalidateQueries({ queryKey: ["admin-roadmap"] });
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      qc.invalidateQueries({ queryKey: ["next"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't save"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "New item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update this entry on the roadmap." : "Add a video or live stream to the roadmap."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v as ItemType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as ItemStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduledAt">Scheduled for</Label>
            <DateTimePicker
              id="scheduledAt"
              value={form.scheduledAt}
              onChange={(v) => set("scheduledAt", v)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://youtube.com/watch?v=…"
                value={form.youtubeUrl}
                onChange={(e) => set("youtubeUrl", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://…"
                value={form.thumbnailUrl}
                onChange={(e) => set("thumbnailUrl", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="comma, separated"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : item ? "Save changes" : "Add item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
