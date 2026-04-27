import { AppLayout } from "@/components/layout/AppLayout";
import { useEhGetMe, useEhLogout } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";

export default function Account() {
  const { data: me } = useEhGetMe();
  const logout = useEhLogout();
  const [, setLocation] = useLocation();

  if (!me) return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground">Manage your personal account settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Your personal information and role within the organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email Address</div>
                <div className="font-semibold">{me.user.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Role</div>
                <div className="font-semibold capitalize">{me.user.role}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Organization</div>
                <div className="font-semibold">{me.org.name}</div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border/50">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={logout.isPending}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
