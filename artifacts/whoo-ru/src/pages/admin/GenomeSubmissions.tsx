import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Dna, Download, Search, Trash2, Globe, Users, BarChart3, TestTube, Eye, X, Copy, Check, Pencil } from "lucide-react";

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
  beliefValues?: Record<string, number | null>;
}

interface Stats {
  totalSubmissions: number;
  totalWithTest: number;
  uniqueCountries: number;
  avgDimensionsExplored: number;
}

const CATEGORIES: { key: string; label: string; color: string; dims: number[] }[] = [
  { key: 'epistemology',  label: 'Epistemology',    color: '#6c63ff', dims: [4,5,6,7,8,9,10,11,12,13] },
  { key: 'spirituality',  label: 'Spirituality',    color: '#ff9f43', dims: [14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
  { key: 'morality',      label: 'Morality',        color: '#ee5a24', dims: [29,30,31,32,33,34,35,36,37,38,39,40,41,42,43] },
  { key: 'politics',      label: 'Politics',        color: '#0097e6', dims: [44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63] },
  { key: 'social',        label: 'Social',          color: '#44bd32', dims: [64,65,66,67,68,69,70,71,72,73,74,75,76,77,78] },
  { key: 'economics',     label: 'Economics',       color: '#e1b12c', dims: [79,80,81,82,83,84,85,86,87,88] },
  { key: 'science_tech',  label: 'Science & Tech',  color: '#00d2d3', dims: [89,90,91,92,93,94,95,96,97,98] },
  { key: 'education',     label: 'Education',       color: '#c56cf0', dims: [99,100,101,102,103] },
  { key: 'health',        label: 'Health',          color: '#ff4757', dims: [104,105,106,107,108] },
  { key: 'psychology',    label: 'Psychology',      color: '#2ed573', dims: [109,110,111,112,113,114,115,116,117,118] },
  { key: 'relationships', label: 'Relationships',   color: '#ff6b81', dims: [119,120,121,122,123,124,125,126,127] },
];

const CATEGORY_COLORS: Record<number, string> = {};
CATEGORIES.forEach(cat => {
  cat.dims.forEach(d => { CATEGORY_COLORS[d] = cat.color; });
});

function parseDnaStats(dnaString: string) {
  const beliefs = dnaString.slice(16);
  let totalResponses = 0;
  let dimsMapped = 0;
  let totalValue = 0;

  for (let i = 0; i < beliefs.length; i++) {
    const ch = beliefs[i];
    if (ch !== '.') {
      totalResponses++;
      dimsMapped++;
      totalValue += parseInt(ch);
    }
  }

  const avgConfidence = dimsMapped > 0 ? Math.round((totalValue / (dimsMapped * 9)) * 100) : 0;
  return { totalResponses, dimsMapped, totalDims: 124, avgConfidence };
}

function getCategoryScores(dnaString: string) {
  const beliefs = dnaString.slice(16);
  return CATEGORIES.map(cat => {
    let explored = 0;
    let total = 0;
    cat.dims.forEach(dimId => {
      const idx = dimId - 4;
      if (idx >= 0 && idx < beliefs.length) {
        const ch = beliefs[idx];
        if (ch !== '.') {
          explored++;
          total += parseInt(ch);
        }
      }
    });
    const coverage = Math.round((explored / cat.dims.length) * 100);
    return { ...cat, explored, totalDims: cat.dims.length, coverage };
  });
}

function colorDnaChar(char: string, index: number): { color: string; isBold: boolean } {
  if (index < 16) {
    if (index === 0) return { color: '#6c8fff', isBold: true };
    if (index <= 2) return { color: '#a78bfa', isBold: true };
    if (index <= 4) return { color: '#22d3ee', isBold: false };
    if (index <= 6) return { color: '#22d3ee', isBold: false };
    if (index === 7) return { color: '#f59e0b', isBold: true };
    if (index <= 10) return { color: '#6c8fff', isBold: true };
    return { color: '#94a3b8', isBold: false };
  }
  const dimId = (index - 16) + 4;
  if (char === '.') return { color: '#334155', isBold: false };
  const catColor = CATEGORY_COLORS[dimId];
  if (catColor) return { color: catColor, isBold: false };
  return { color: '#94a3b8', isBold: false };
}

function GenomeViewerPopup({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const dna = submission.dnaString;
  const stats = parseDnaStats(dna);
  const catScores = getCategoryScores(dna);
  const updatedDate = new Date(submission.submittedAt);
  const timeAgo = getTimeAgo(updatedDate);

  const handleCopy = () => {
    navigator.clipboard.writeText(dna);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-[#0a0e1f] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dna size={18} className="text-primary" />
              <span className="font-display font-bold text-foreground">Your Belief DNA String</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs text-muted-foreground hover:text-foreground hover:border-white/30 transition-colors"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="font-mono text-xs leading-relaxed tracking-wide break-all select-all bg-[#060818] rounded-xl p-4 border border-white/5">
            {dna.split('').map((ch, i) => {
              const { color, isBold } = colorDnaChar(ch, i);
              const addSpace = (i === 16) || (i > 16 && (i - 16) % 10 === 0);
              return (
                <span key={i}>
                  {addSpace && ' '}
                  <span style={{ color, fontWeight: isBold ? 700 : 400 }}>{ch}</span>
                </span>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono">
            <span className="text-muted-foreground">
              <span className="text-foreground font-bold">{stats.totalResponses}</span> responses
            </span>
            <span className="text-muted-foreground">
              <span className="text-foreground font-bold">{stats.dimsMapped}</span> / {stats.totalDims} dims mapped
            </span>
            <span className="text-muted-foreground">
              <span className="text-foreground font-bold">{stats.avgConfidence}%</span> avg confidence
            </span>
            <span className="text-muted-foreground">
              Updated <span className="text-foreground font-bold">{timeAgo}</span>
            </span>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dimension Coverage</p>
            <div className="space-y-2">
              {catScores.map(cat => (
                <div key={cat.key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 text-right shrink-0">{cat.label}</span>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.coverage}%`,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}cc)`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">{cat.coverage}%</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/60 leading-relaxed border-t border-white/5 pt-4">
            This string encodes your position across 124 belief dimensions on a 0–9 scale. 5 = neutral/uncertain. Plant this key into any AI system for instant cognitive alignment.
          </p>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function GenomeSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "real" | "test">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewingSub, setViewingSub] = useState<Submission | null>(null);
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

  const handleToggleTest = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/genome/admin/submissions/${id}/toggle-test`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(prev => prev.map(s =>
          s.id === id ? { ...s, isTestData: data.isTestData } : s
        ));
      }
    } catch {}
  };

  const handlePromoteAll = async () => {
    if (!confirm("Promote ALL test submissions to Real? This will make them visible on the Explore Beliefs page.")) return;
    try {
      const res = await fetch(`${API_BASE}/genome/admin/promote-test`, {
        method: "POST",
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
              onClick={handlePromoteAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium"
            >
              <Pencil size={16} /> Promote All → Real
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
                      <button
                        onClick={() => handleToggleTest(sub.id)}
                        title={sub.isTestData ? "Click to mark as Real" : "Click to mark as Test"}
                        className="cursor-pointer"
                      >
                        {sub.isTestData ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
                            <TestTube size={10} /> Test
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                            Real
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleTest(sub.id)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors"
                          title={sub.isTestData ? "Mark as Real" : "Mark as Test"}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setViewingSub(sub)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="View genome"
                        >
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
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

      {viewingSub && (
        <GenomeViewerPopup submission={viewingSub} onClose={() => setViewingSub(null)} />
      )}
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
