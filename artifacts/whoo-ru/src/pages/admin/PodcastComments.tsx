import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Check, AlertTriangle, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminPodcastComments,
  useAdminUpdateComment,
  useAdminDeleteComment,
} from "@/hooks/use-podcasts";

const TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "spam", label: "Spam" },
];

export default function PodcastComments() {
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useAdminPodcastComments(tab);
  const upd = useAdminUpdateComment();
  const del = useAdminDeleteComment();

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/podcast" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Podcast Comments</h1>
          <p className="text-muted-foreground text-sm">Moderate comments across all episodes.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : !data?.comments.length ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">No comments in this view.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.comments.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{c.authorName}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.episodeSlug && (
                    <Link
                      href={`/podcast/${c.episodeSlug}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      target="_blank"
                    >
                      on “{c.episodeTitle}” <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(c.createdAt), "MMM d, yyyy · h:mm a")}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3 leading-relaxed">{c.body}</p>
              <div className="flex gap-2 flex-wrap">
                {c.status !== "approved" && (
                  <button
                    onClick={() => upd.mutate({ id: c.id, status: "approved" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20"
                  >
                    <Check size={12} /> Approve
                  </button>
                )}
                {c.status !== "spam" && (
                  <button
                    onClick={() => upd.mutate({ id: c.id, status: "spam" })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20"
                  >
                    <AlertTriangle size={12} /> Mark spam
                  </button>
                )}
                <button
                  onClick={() => { if (window.confirm("Delete this comment?")) del.mutate(c.id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 ml-auto"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-green-500/10 text-green-500 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    spam: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || ""}`}>
      {status}
    </span>
  );
}
