import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminEarlyBird, useAdminDeleteEarlyBird } from "@/hooks/use-admin";
import { useState } from "react";
import { Trash2, Download, Bird } from "lucide-react";
import { format } from "date-fns";

export default function AdminEarlyBird() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminEarlyBird({ page, limit: 25 });
  const deleteEB = useAdminDeleteEarlyBird();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Early Bird List</h1>
            {data && <p className="text-sm text-muted-foreground mt-1">{data.total} total signups</p>}
          </div>
          <a
            href="/api/admin/earlybird/export"
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Signup Date</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">Loading...</td></tr>
                ) : data?.entries?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <Bird className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No early bird signups yet</p>
                    </td>
                  </tr>
                ) : (
                  data?.entries?.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-foreground">{entry.name || "—"}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{entry.email}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { if (confirm("Delete this entry?")) deleteEB.mutate({ id: entry.id }); }}
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
