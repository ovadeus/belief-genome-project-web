import { useState } from "react";
import { Search, Dna, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGenomeUsers, type AdminGenomeUser } from "@/hooks/use-admin-users";

function DnaCell({ dna }: { dna: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!dna) {
    return <span className="text-xs text-muted-foreground italic">no DNA yet</span>;
  }
  // Show only the prefix and tail of the long DNA string so it stays readable.
  const display = dna.length > 22 ? `${dna.slice(0, 12)}…${dna.slice(-6)}` : dna;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(dna);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      title={dna}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-primary transition"
    >
      <span className="truncate max-w-[180px]">{display}</span>
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-400" />
        : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

function UserRow({ user }: { user: AdminGenomeUser }) {
  return (
    <tr className="border-b border-border/50 hover:bg-foreground/5">
      <td className="px-6 py-4 text-sm text-foreground">{user.name || "—"}</td>
      <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
      <td className="px-6 py-4 text-sm text-foreground tabular-nums text-right">
        {user.probeCount.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <DnaCell dna={user.latestDnaString} />
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {format(new Date(user.createdAt), "MMM d, yyyy")}
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useAdminGenomeUsers({ page, limit: 25, search });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Dna className="w-6 h-6 text-primary" />
              Users
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Belief Genome app users — registered accounts that have answered probes.
            </p>
          </div>
          {data && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">
                {data.total.toLocaleString()}
              </span>{" "}
              total
            </div>
          )}
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
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Probes</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">DNA Serial Key</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-destructive">{error}</td></tr>
                ) : !data?.users?.length ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No users found</td></tr>
                ) : (
                  data.users.map(u => <UserRow key={u.id} user={u} />)
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
