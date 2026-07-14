import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Pencil, Plus, RefreshCw, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatusPill, TypeBadge } from "@/components/ItemChrome.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { api, ApiError } from "@/lib/api.ts";
import { clearToken } from "@/lib/auth.ts";
import { scheduleStamp } from "@/lib/format.ts";
import type { RoadmapItem } from "@/lib/types.ts";
import { ItemDialog } from "./ItemDialog.tsx";

export function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoadmapItem | null>(null);

  const bounceToLogin = () => {
    clearToken();
    navigate("/admin/login");
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-roadmap"],
    queryFn: api.adminList,
    retry: false,
  });

  if (isError && error instanceof ApiError && error.status === 401) {
    bounceToLogin();
  }

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-roadmap"] });
    qc.invalidateQueries({ queryKey: ["roadmap"] });
    qc.invalidateQueries({ queryKey: ["next"] });
  };

  const publish = useMutation({
    mutationFn: (id: string) => api.publish(id),
    onSuccess: () => {
      toast.success("Published — Discord notified");
      invalidateAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.remove(id),
    onSuccess: () => {
      toast.success("Item deleted");
      invalidateAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sync = useMutation({
    mutationFn: () => api.sync(),
    onSuccess: (r) => {
      toast.success(`Synced — ${r.created} new, ${r.updated} updated`);
      invalidateAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: RoadmapItem) => {
    setEditing(item);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Control room</span>
          <h1 className="mt-2 font-display text-3xl font-bold">Roadmap admin</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="surface" size="sm" onClick={() => sync.mutate()} disabled={sync.isPending}>
            <RefreshCw className={sync.isPending ? "animate-spin" : ""} />
            Sync now
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus />
            New item
          </Button>
          <Button variant="ghost" size="sm" onClick={bounceToLogin}>
            <LogOut />
            Log out
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-muted">Loading…</p>}
        {data && data.items.length === 0 && (
          <Card className="border-dashed p-12 text-center">
            <p className="text-muted">No items yet. Add one or run a sync.</p>
          </Card>
        )}

        {data && data.items.length > 0 && (
          <Card className="divide-y divide-line overflow-hidden">
            {data.items.map((item) => {
              const stamp = scheduleStamp(item.scheduledAt ?? item.publishedAt);
              return (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeBadge type={item.type} />
                      <StatusPill status={item.status} />
                      {item.source === "youtube" && (
                        <span className="font-mono text-[0.62rem] uppercase tracking-wider text-faint">
                          via youtube
                        </span>
                      )}
                    </div>
                    <div className="truncate font-medium text-ink">{item.title}</div>
                    {stamp && <div className="font-mono text-xs text-muted">{stamp}</div>}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {item.status !== "published" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Publish & notify Discord"
                        onClick={() => publish.mutate(item.id)}
                        disabled={publish.isPending}
                      >
                        <Send />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(item)}>
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      className="hover:text-live"
                      onClick={() => {
                        if (confirm(`Delete "${item.title}"?`)) remove.mutate(item.id);
                      }}
                      disabled={remove.isPending}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      <ItemDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editing} />
    </div>
  );
}
