import { Link, useLocation } from "wouter";
import { useEhGetMe, useEhLogout, getEhGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { LayoutDashboard, CreditCard, UserCircle, LogOut, Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: me, isLoading, isError } = useEhGetMe({
    query: {
      queryKey: getEhGetMeQueryKey(),
      retry: false,
    }
  });

  const logout = useEhLogout();

  useEffect(() => {
    if (isError) {
      setLocation("/login");
    }
  }, [isError, setLocation]);

  if (isLoading || !me) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link href="/app/dashboard" className="flex items-center space-x-2">
              <span className="font-display font-bold">
                Entropy Harvester
              </span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-sm">{me.org.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">{me.user.email}</span>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8 py-8">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <nav className="flex flex-col gap-2">
              <Link href="/app/dashboard">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/app/billing">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </Button>
              </Link>
              <Link href="/app/account">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <UserCircle className="h-4 w-4" />
                  Account
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
