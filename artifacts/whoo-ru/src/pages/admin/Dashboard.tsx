import { AdminLayout } from "@/components/layout/AdminLayout";
import { useDashboardStats } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Users, BookOpen, FileText, CheckCircle, Database, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const API_BASE = "/api";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-card w-48 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-card rounded-2xl" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-display font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Subscribers" 
          value={stats?.totalSubscribers || 0} 
          icon={Users} 
          color="text-primary" 
          bg="bg-primary/10" 
        />
        <StatCard 
          title="Early Bird List" 
          value={stats?.totalEarlyBird || 0} 
          icon={BookOpen} 
          color="text-secondary" 
          bg="bg-secondary/10" 
        />
        <StatCard 
          title="Published Posts" 
          value={stats?.publishedPosts || 0} 
          icon={CheckCircle} 
          color="text-green-500" 
          bg="bg-green-500/10" 
        />
        <StatCard 
          title="Total Posts" 
          value={stats?.totalPosts || 0} 
          icon={FileText} 
          color="text-accent" 
          bg="bg-accent/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
            Recent Signups
          </h2>
          <div className="space-y-4">
            {stats?.recentSubscribers?.length ? stats.recentSubscribers.map(sub => (
              <div key={sub.id} className="flex justify-between items-center gap-4 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{sub.email}</p>
                  <p className="text-sm text-muted-foreground truncate">{sub.name || 'No name provided'}</p>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className="text-xs font-medium px-2 py-1 bg-background border border-border rounded-md uppercase tracking-wider text-muted-foreground">
                    {sub.source}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(sub.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">No recent signups</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Recent Blog Activity</h2>
          <div className="space-y-4">
            {stats?.recentPosts?.length ? stats.recentPosts.map(post => (
              <div key={post.id} className="flex justify-between items-center gap-4 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{post.slug}</p>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md capitalize ${
                    post.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">No recent posts</p>}
          </div>
        </div>
      </div>

      <AdminTools />
    </AdminLayout>
  );
}

function AdminTools() {
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function runSeed() {
    if (!confirm("Seed this database with ~4,760 test submissions? (Replaces existing test data; real user submissions untouched.)")) return;
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE}/admin/seed-explore-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wipeFirst: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      toast({
        title: "Seed complete",
        description: `Wiped ${data.wiped.toLocaleString()} old rows · inserted ${data.inserted.toLocaleString()} new rows (${data.usersPerWeek}/week × ${data.weeks} weeks).`,
      });
    } catch (err: any) {
      toast({ title: "Seed failed", description: err.message, variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  }

  async function runClear() {
    if (!confirm("Remove ALL test submissions from this database? (is_test_data = true rows only; real users are safe.)")) return;
    setClearing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/test-data`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      toast({
        title: "Cleanup complete",
        description: `Removed ${data.removed.toLocaleString()} test rows.`,
      });
    } catch (err: any) {
      toast({ title: "Cleanup failed", description: err.message, variant: "destructive" });
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="mt-12 bg-card border border-border rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-2">Admin Tools</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Use these to populate the Explore Beliefs visualizations with realistic test data on any environment
        (including production). Operations only affect rows flagged <code>is_test_data=true</code> — real user
        submissions are never touched.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={runSeed}
          disabled={seeding || clearing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Database size={16} />
          {seeding ? "Seeding…" : "Seed Explore Test Data"}
        </button>
        <button
          onClick={runClear}
          disabled={seeding || clearing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 font-medium hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
          {clearing ? "Clearing…" : "Clear All Test Data"}
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
