import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminConsents, useAdminDeleteConsent } from "@/hooks/use-admin";
import { useState } from "react";
import { Search, Trash2, Download, FileCheck2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminConsents() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminConsents({ page, limit: 25, search: search || undefined });
  const deleteConsent = useAdminDeleteConsent();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="text-primary" size={24} />
              Consent Agreements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review participants who have agreed to the Consent Form.
            </p>
          </div>
          <a
            href="/api/admin/consents/export"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-foreground/5 transition-all"
            data-testid="link-export-consents"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search by email"
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground text-sm"
              data-testid="input-search-consents"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {data ? `${data.total} total` : ""}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground text-sm">Loading consents...</td></tr>
                ) : !data?.consents?.length ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground text-sm">No consent agreements yet.</td></tr>
                ) : (
                  data.consents.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-foreground/5" data-testid={`row-consent-${c.id}`}>
                      <td className="px-6 py-4 text-sm text-foreground" data-testid={`text-email-${c.id}`}>{c.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{c.source || "—"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(c.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { if (confirm("Delete this consent record?")) deleteConsent.mutate({ id: c.id }); }}
                          className="text-muted-foreground hover:text-destructive transition p-1"
                          data-testid={`button-delete-${c.id}`}
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-5 py-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground disabled:opacity-30 active:scale-95 transition-all">Previous</button>
            <span className="text-sm text-muted-foreground px-2">Page {page} of {data.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages} className="px-5 py-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground disabled:opacity-30 active:scale-95 transition-all">Next</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
