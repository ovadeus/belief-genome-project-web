import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Globe, FileEdit, Mic, Headphones, Heart, Download, MessageSquare } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminPodcastEpisodes,
  useAdminDeletePodcast,
  useAdminTogglePodcastStatus,
  useAdminPodcastAnalytics,
  formatDuration,
} from "@/hooks/use-podcasts";

export default function AdminPodcastList() {
  const { data, isLoading } = useAdminPodcastEpisodes();
  const { data: analytics } = useAdminPodcastAnalytics();
  const del = useAdminDeletePodcast();
  const toggle = useAdminTogglePodcastStatus();

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Podcast</h1>
          <p className="text-muted-foreground">Manage your podcast episodes.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/podcast/comments"
            className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-foreground/5 transition-colors"
          >
            <MessageSquare size={18} /> Comments
          </Link>
          <Link
            href="/admin/podcast/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> New Episode
          </Link>
        </div>
      </div>

      {/* Mini analytics summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatTile icon={<Mic size={16} />} label="Episodes" value={analytics.totals.total} sub={`${analytics.totals.published} published`} />
          <StatTile icon={<Headphones size={16} />} label="Total plays" value={analytics.totals.listens} sub="all time" />
          <StatTile icon={<Download size={16} />} label="Downloads" value={analytics.totals.downloads} sub="all time" />
          <StatTile icon={<Heart size={16} />} label="Likes" value={analytics.totals.likes} sub="all time" />
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Episode</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Stats</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm">Date</th>
                <th className="px-6 py-4 font-medium text-muted-foreground text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              ) : !data?.episodes.length ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">
                  <Mic className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  No episodes yet. Create your first one.
                </td></tr>
              ) : (
                data.episodes.map((ep) => (
                  <tr key={ep.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {ep.coverImagePath ? (
                            <img src={`/api/storage${ep.coverImagePath}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Mic size={18} className="text-primary/60" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{ep.title}</p>
                          <p className="text-xs text-muted-foreground">/{ep.slug} · {formatDuration(ep.durationSec)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggle.mutate(ep.id)}
                        disabled={toggle.isPending}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider active:scale-95 transition-all border ${
                          ep.status === "published"
                            ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                        }`}
                      >
                        {ep.status === "published" ? <Globe size={14} /> : <FileEdit size={14} />}
                        {ep.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1"><Headphones size={12} /> {ep.listenCount.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart size={12} /> {ep.likeCount.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Download size={12} /> {ep.downloadCount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(ep.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/podcast/edit/${ep.id}`}
                          className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg active:scale-90 transition-all"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this episode? This cannot be undone.")) del.mutate(ep.id);
                          }}
                          className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg active:scale-90 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatTile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        {icon}<span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground font-display">{value.toLocaleString()}</p>
      <p className="text-[10px] text-muted-foreground/70 mt-0.5 uppercase tracking-wider">{sub}</p>
    </div>
  );
}
