import { AdminLayout } from "@/components/layout/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart3,
  Eye,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  Globe,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DEVICE_COLORS: Record<string, string> = {
  Desktop: "var(--accent-bright)",
  Mobile: "var(--accent-text)",
  Tablet: "#22d3ee",
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  Desktop: <Monitor size={14} />,
  Mobile: <Smartphone size={14} />,
  Tablet: <Tablet size={14} />,
};

type AnalyticsData = {
  days: number;
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  todayVisitors: number;
  viewsByDay: { date: string; views: number; visitors: number }[];
  topPages: { path: string; views: number; visitors: number }[];
  topReferrers: { referrer: string; views: number }[];
  deviceBreakdown: { device: string; views: number }[];
};

function useAnalytics(days: number) {
  return useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", days],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/admin/analytics?days=${days}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}

export default function Analytics() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useAnalytics(days);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Analytics</h1>
            <p className="text-muted-foreground mt-1">Page views and visitor traffic</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Eye size={20} />}
                label="Total Views"
                value={data.totalViews.toLocaleString()}
                sub={`Last ${days} days`}
              />
              <StatCard
                icon={<Users size={20} />}
                label="Unique Visitors"
                value={data.uniqueVisitors.toLocaleString()}
                sub={`Last ${days} days`}
              />
              <StatCard
                icon={<TrendingUp size={20} />}
                label="Today Views"
                value={data.todayViews.toLocaleString()}
                sub="Since midnight"
              />
              <StatCard
                icon={<Users size={20} />}
                label="Today Visitors"
                value={data.todayVisitors.toLocaleString()}
                sub="Since midnight"
              />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Traffic Over Time
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.viewsByDay}>
                    <defs>
                      <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-bright)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--accent-bright)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-text)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--accent-text)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => {
                        const dt = new Date(d + "T00:00:00");
                        return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      }}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f1225",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        fontSize: 13,
                      }}
                      labelFormatter={(d: string) => {
                        const dt = new Date(d + "T00:00:00");
                        return dt.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="var(--accent-bright)"
                      fill="url(#viewGrad)"
                      strokeWidth={2}
                      name="Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="var(--accent-text)"
                      fill="url(#visitorGrad)"
                      strokeWidth={2}
                      name="Visitors"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                  Top Pages
                </h2>
                <div className="space-y-3">
                  {data.topPages.length === 0 && (
                    <p className="text-muted-foreground text-sm">No page view data yet.</p>
                  )}
                  {data.topPages.map((p, i) => {
                    const maxViews = data.topPages[0]?.views || 1;
                    return (
                      <div key={p.path} className="relative">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary/10 rounded-lg"
                          style={{ width: `${(p.views / maxViews) * 100}%` }}
                        />
                        <div className="relative flex items-center justify-between py-2.5 px-3">
                          <span className="text-sm text-foreground font-mono truncate flex-1">
                            {p.path}
                          </span>
                          <div className="flex gap-4 shrink-0 ml-4 text-sm">
                            <span className="text-muted-foreground">
                              {p.views.toLocaleString()} views
                            </span>
                            <span className="text-muted-foreground/70">
                              {p.visitors.toLocaleString()} visitors
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                    Devices
                  </h2>
                  {data.deviceBreakdown.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No data yet.</p>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.deviceBreakdown}
                              dataKey="views"
                              nameKey="device"
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={55}
                              strokeWidth={0}
                            >
                              {data.deviceBreakdown.map((entry) => (
                                <Cell
                                  key={entry.device}
                                  fill={DEVICE_COLORS[entry.device] || "#64748b"}
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 flex-1">
                        {data.deviceBreakdown.map((d) => {
                          const total = data.deviceBreakdown.reduce((a, b) => a + b.views, 0);
                          const pct = total > 0 ? ((d.views / total) * 100).toFixed(1) : "0";
                          return (
                            <div key={d.device} className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">{DEVICE_ICONS[d.device]}</span>
                              <span className="text-foreground">{d.device}</span>
                              <span className="text-muted-foreground ml-auto">{pct}%</span>
                              <span className="text-muted-foreground/60">{d.views.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                    Top Referrers
                  </h2>
                  <div className="space-y-2">
                    {data.topReferrers.length === 0 && (
                      <p className="text-muted-foreground text-sm">No referrer data yet.</p>
                    )}
                    {data.topReferrers.map((r) => {
                      let domain = r.referrer;
                      try {
                        domain = new URL(r.referrer).hostname;
                      } catch {}
                      return (
                        <div key={r.referrer} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2 text-sm text-foreground truncate">
                            <ExternalLink size={13} className="text-muted-foreground shrink-0" />
                            <span className="truncate">{domain}</span>
                          </div>
                          <span className="text-sm text-muted-foreground ml-4 shrink-0">
                            {r.views.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground font-display">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}
