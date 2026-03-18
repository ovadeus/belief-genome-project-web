import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminSubscribers, useAdminDeleteSubscriber } from "@/hooks/use-admin";
import { useState } from "react";
import { Search, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

export default function AdminSubscribers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const { data, isLoading } = useAdminSubscribers({ page, limit: 25, search: search || undefined, source: source || undefined });
  const deleteSub = useAdminDeleteSubscriber();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-foreground">Subscribers</h1>
          <a
            href="/api/admin/subscribers/export"
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none"
              placeholder="Search by name or email..."
            />
          </div>
          <select
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
            className="bg-background border border-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Sources</option>
            <option value="newsletter">Newsletter</option>
            <option value="book">Book</option>
            <option value="app">App</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Source</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading...</td></tr>
                ) : data?.subscribers?.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No subscribers found</td></tr>
                ) : (
                  data?.subscribers?.map((sub) => (
                    <tr key={sub.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-foreground">{sub.name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{sub.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {sub.source || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(sub.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { if (confirm("Delete this subscriber?")) deleteSub.mutate({ id: sub.id }); }}
                          className="text-muted-foreground hover:text-destructive transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-foreground disabled:opacity-30">Previous</button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages} className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-foreground disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
