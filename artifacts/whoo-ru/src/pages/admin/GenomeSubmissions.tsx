import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Dna, Download, Search, Trash2, Globe, Users, BarChart3, TestTube } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface Submission {
  id: number;
  anonymousKey: string;
  dnaString: string;
  gender: string;
  countryCode: string;
  zipCode: string;
  birthYear: number;
  dimensionsExplored: number;
  isTestData: boolean;
  submittedAt: string;
}

interface Stats {
  totalSubmissions: number;
  totalWithTest: number;
  uniqueCountries: number;
  avgDimensionsExplored: number;
}

export default function GenomeSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "real" | "test">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (filter !== "all") params.set("filter", filter);

      const [subRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/genome/admin/submissions?${params}`, { credentials: "include" }),
        fetch(`${API_BASE}/genome/stats`, { credentials: "include" }),
      ]);

      if (subRes.ok) {
        const data = await subRes.json();
        setSubmissions(data.submissions || []);
        setTotal(data.total || 0);
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch genome data:", err);
    }
    setLoading(false);
  }, [page, search, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this submission?")) return;
    try {
      const res = await fetch(`${API_BASE}/genome/admin/submissions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchData();
    } catch {}
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (search) params.set("search", search);
    window.open(`${API_BASE}/genome/admin/export?${params}`, "_blank");
  };

  const handlePurgeTest = async () => {
    if (!confirm("Delete ALL test submissions? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/genome/admin/purge-test`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchData();
    } catch {}
  };

  const countryName = (code: string) => {
    const map: Record<string, string> = {
      "840": "US", "826": "UK", "124": "CA", "036": "AU", "276": "DE",
      "250": "FR", "356": "IN", "076": "BR", "392": "JP", "410": "KR",
      "484": "MX", "380": "IT", "724": "ES", "528": "NL", "752": "SE",
      "616": "PL", "710": "ZA",
    };
    return map[code] || code;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Genome Submissions</h1>
            <p className="text-muted-foreground mt-1">Anonymous belief DNA submissions from desktop app users</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={handlePurgeTest}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
            >
              <TestTube size={16} /> Purge Test Data
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Dna} label="Real Submissions" value={stats.totalSubmissions} />
            <StatCard icon={TestTube} label="Total (incl. test)" value={stats.totalWithTest} />
            <StatCard icon={Globe} label="Countries" value={stats.uniqueCountries} />
            <StatCard icon={BarChart3} label="Avg Dimensions" value={stats.avgDimensionsExplored} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by country, key, zip..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:ring-2 focus:ring-primary/30 outline-none"
          >
            <option value="all">All Submissions</option>
            <option value="real">Real Only</option>
            <option value="test">Test Only</option>
          </select>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zip</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Birth Year</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dims</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
                ) : submissions.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No submissions found</td></tr>
                ) : submissions.map((sub) => (
                  <tr key={sub.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{sub.anonymousKey.slice(0, 12)}...</td>
                    <td className="px-4 py-3">{countryName(sub.countryCode)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{sub.zipCode}</td>
                    <td className="px-4 py-3">{sub.gender}</td>
                    <td className="px-4 py-3">{sub.birthYear}</td>
                    <td className="px-4 py-3">{sub.dimensionsExplored}</td>
                    <td className="px-4 py-3">
                      {sub.isTestData ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          <TestTube size={10} /> Test
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                          Real
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-card border border-border text-sm disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-card border border-border text-sm disabled:opacity-40 hover:bg-white/5 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
