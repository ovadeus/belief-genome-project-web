import { useMemo, useState } from "react";
import { Search, Dna, Copy, Check, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAdminGenomeUsers, type AdminGenomeUser } from "@/hooks/use-admin-users";

type SortKey = "name" | "email" | "probeCount" | "latestDnaString" | "createdAt";
type SortDir = "asc" | "desc";

function SortHeader({
  label, sortKey, current, dir, onSort, align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = current === sortKey;
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th className={`${align === "right" ? "text-right" : "text-left"} text-xs font-medium uppercase tracking-wider px-6 py-3`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 ${align === "right" ? "flex-row-reverse" : ""} ${active ? "text-foreground" : "text-muted-foreground"} hover:text-foreground transition`}
      >
        <span>{label}</span>
        <Icon className={`w-3.5 h-3.5 ${active ? "opacity-100" : "opacity-50"}`} />
      </button>
    </th>
  );
}

function DnaCell({ dna }: { dna: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!dna) {
    return <span className="text-xs text-muted-foreground italic">no DNA yet</span>;
  }
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

function compareUsers(a: AdminGenomeUser, b: AdminGenomeUser, key: SortKey, dir: SortDir): number {
  const mult = dir === "asc" ? 1 : -1;
  let av: string | number = "";
  let bv: string | number = "";
  switch (key) {
    case "name":
      av = (a.name || "").toLowerCase();
      bv = (b.name || "").toLowerCase();
      break;
    case "email":
      av = (a.email || "").toLowerCase();
      bv = (b.email || "").toLowerCase();
      break;
    case "probeCount":
      av = a.probeCount;
      bv = b.probeCount;
      break;
    case "latestDnaString":
      // sort by whether DNA exists, then by string
      av = a.latestDnaString ? `1_${a.latestDnaString}` : "0";
      bv = b.latestDnaString ? `1_${b.latestDnaString}` : "0";
      break;
    case "createdAt":
      av = new Date(a.createdAt).getTime();
      bv = new Date(b.createdAt).getTime();
      break;
  }
  if (av < bv) return -1 * mult;
  if (av > bv) return 1 * mult;
  return 0;
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const { data, isLoading, error } = useAdminGenomeUsers({ page, limit: pageSize, search });

  const onSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "name" || k === "email" ? "asc" : "desc");
    }
  };

  const sortedUsers = useMemo(() => {
    if (!data?.users) return [];
    return [...data.users].sort((a, b) => compareUsers(a, b, sortKey, sortDir));
  }, [data, sortKey, sortDir]);

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
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-background border border-input rounded-xl px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
            title="Rows per page"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={250}>250 per page</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <SortHeader label="Name" sortKey="name" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortHeader label="Email" sortKey="email" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortHeader label="Probes" sortKey="probeCount" current={sortKey} dir={sortDir} onSort={onSort} align="right" />
                  <SortHeader label="DNA Serial Key" sortKey="latestDnaString" current={sortKey} dir={sortDir} onSort={onSort} />
                  <SortHeader label="Joined" sortKey="createdAt" current={sortKey} dir={sortDir} onSort={onSort} />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-destructive">{error}</td></tr>
                ) : !sortedUsers.length ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No users found</td></tr>
                ) : (
                  sortedUsers.map(u => <UserRow key={u.id} user={u} />)
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
