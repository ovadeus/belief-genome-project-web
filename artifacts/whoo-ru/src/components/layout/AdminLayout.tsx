import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Users, Bookmark, Settings, LogOut, BrainCircuit } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/earlybird", label: "Early Bird", icon: Bookmark },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout, isAuthenticated, isLoading } = useAuth();

  // Protect route
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!isAuthenticated && location !== "/admin/login") {
    window.location.href = "/admin/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex fixed inset-y-0 left-0 z-10">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-foreground font-display font-bold text-xl">
            <BrainCircuit className="text-primary" />
            WhooRU Admin
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors font-medium text-left"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border bg-card flex items-center px-4 sticky top-0 z-20">
           <Link href="/admin/dashboard" className="flex items-center gap-2 text-foreground font-display font-bold">
            <BrainCircuit className="text-primary" size={20} />
            WhooRU Admin
          </Link>
          <button 
            onClick={() => logout.mutate()}
            className="ml-auto text-sm text-muted-foreground"
          >
            Logout
          </button>
        </header>

        <div className="p-6 md:p-10 flex-1 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
