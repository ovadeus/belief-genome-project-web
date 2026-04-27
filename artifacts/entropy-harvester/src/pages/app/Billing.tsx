import { AppLayout } from "@/components/layout/AppLayout";
import { useEhGetMe, useEhCreateCheckoutSession, useEhCreatePortalSession, type EhMe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Billing() {
  const { data: me } = useEhGetMe();
  const createCheckout = useEhCreateCheckoutSession();
  const createPortal = useEhCreatePortalSession();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    
    if (status === "success") {
      toast.success("Subscription updated successfully");
    } else if (status === "cancelled") {
      toast.info("Checkout cancelled");
    }

    if (status) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <AppLayout>
      {me ? (
        <BillingContent
          me={me}
          createCheckout={createCheckout}
          createPortal={createPortal}
        />
      ) : null}
    </AppLayout>
  );
}

type BillingContentProps = {
  me: EhMe;
  createCheckout: ReturnType<typeof useEhCreateCheckoutSession>;
  createPortal: ReturnType<typeof useEhCreatePortalSession>;
};

function BillingContent({ me, createCheckout, createPortal }: BillingContentProps) {
  const plan = me.subscription?.plan || "free";
  const isFree = plan === "free";

  const handleUpgrade = (planKey: "researcher" | "pro") => {
    createCheckout.mutate(
      { data: { plan: planKey } },
      {
        onSuccess: (data) => {
          window.location.assign(data.url);
        }
      }
    );
  };

  const handleManageBilling = () => {
    createPortal.mutate(undefined, {
      onSuccess: (data) => {
        window.location.assign(data.url);
      }
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing details.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the <strong className="text-foreground capitalize">{plan}</strong> plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {me.subscription && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <div className="font-semibold capitalize">{me.subscription.status}</div>
                </div>
                {me.subscription.currentPeriodEnd && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Current Period End</div>
                    <div className="font-semibold">
                      {format(new Date(me.subscription.currentPeriodEnd), "MMM d, yyyy")}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Harvester Limit</div>
                  <div className="font-semibold">{me.subscription.harvesterCap === -1 ? "Unlimited" : me.subscription.harvesterCap}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Response Limit</div>
                  <div className="font-semibold">{me.subscription.responseCap.toLocaleString()} / mo</div>
                </div>
              </div>
            )}
            {isFree && (
              <div className="pt-4 border-t border-border/50 text-sm text-muted-foreground">
                Upgrade to unlock more harvesters, higher response caps, and data exports.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t bg-muted/20">
            {isFree ? (
              <>
                <Button 
                  onClick={() => handleUpgrade("researcher")} 
                  disabled={createCheckout.isPending}
                  className="w-full sm:w-auto"
                >
                  Upgrade to Researcher ($39/mo)
                </Button>
                <Button 
                  onClick={() => handleUpgrade("pro")} 
                  disabled={createCheckout.isPending}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Upgrade to Pro ($99/mo)
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleManageBilling} 
                disabled={createPortal.isPending}
                className="w-full sm:w-auto"
              >
                {createPortal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Billing
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
