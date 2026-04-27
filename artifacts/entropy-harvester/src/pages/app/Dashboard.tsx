import { AppLayout } from "@/components/layout/AppLayout";
import { useEhGetMe, type EhMe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Users } from "lucide-react";

export default function Dashboard() {
  const { data: me } = useEhGetMe();

  return (
    <AppLayout>
      {me ? <DashboardContent me={me} /> : null}
    </AppLayout>
  );
}

function DashboardContent({ me }: { me: EhMe }) {
  const planName = me.subscription?.plan
    ? me.subscription.plan.charAt(0).toUpperCase() + me.subscription.plan.slice(1)
    : "Free";
  const responseCap = me.subscription?.responseCap || 100;
  // Currently we mock actual usage to 0 for Phase 1 as responses aren't implemented yet
  const responsesUsed = 0;

  const usagePercentage = Math.min(100, (responsesUsed / responseCap) * 100);

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your harvesters and data collection.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Harvester
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responsesUsed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {responsesUsed} / {responseCap.toLocaleString()} limit this period
              </p>
              <div className="mt-4 h-2 w-full bg-secondary overflow-hidden rounded-full">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Harvesters</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently collecting data
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{planName}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {me.org.name} workspace
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No harvesters yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Create your first harvester to start collecting belief data and analyzing epistemic superposition.
          </p>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Harvester
          </Button>
        </Card>
      </div>
    </>
  );
}
