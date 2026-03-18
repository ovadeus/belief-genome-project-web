import { AdminLayout } from "@/components/layout/AdminLayout";
import { useDashboardStats } from "@/hooks/use-admin";
import { Users, BookOpen, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";

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
              <div key={sub.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{sub.email}</p>
                  <p className="text-sm text-muted-foreground">{sub.name || 'No name provided'}</p>
                </div>
                <div className="text-right">
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
              <div key={post.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                <div className="flex-1 pr-4">
                  <p className="font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-sm text-muted-foreground">{post.slug}</p>
                </div>
                <div className="text-right whitespace-nowrap">
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
    </AdminLayout>
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
