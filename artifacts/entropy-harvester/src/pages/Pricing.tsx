import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { useEhGetMe, useEhCreateCheckoutSession, getEhGetMeQueryKey } from "@workspace/api-client-react";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "For individuals exploring the methodology.",
    features: [
      "1 harvester",
      "100 responses/mo",
      "BGP-124 dimensions only",
      "No export",
      "Footer attribution"
    ],
    planKey: null,
  },
  {
    name: "Researcher",
    price: "$39",
    period: "/mo",
    description: "For academics and small teams.",
    features: [
      "5 harvesters",
      "1,000 responses/mo",
      "CSV + JSON export",
      "$0.05/response overage",
      "Footer attribution remains"
    ],
    planKey: "researcher",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/mo",
    description: "For agencies and professional pollsters.",
    features: [
      "Unlimited harvesters",
      "10,000 responses/mo",
      "Custom dimensions (with AI QC)",
      "3D Population Genome",
      "Longitudinal Scar Map",
      "White-label",
      "$0.02/response overage"
    ],
    planKey: "pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with complex needs.",
    features: [
      "Unlimited responses",
      "SSO",
      "Team seats",
      "Dedicated review",
      "Full white-label"
    ],
    planKey: "enterprise",
  }
];

export default function Pricing() {
  const { data: me } = useEhGetMe({ query: { queryKey: getEhGetMeQueryKey(), retry: false } });
  const createCheckout = useEhCreateCheckoutSession();

  const handleCheckout = (planKey: string) => {
    if (!me) {
      window.location.href = "/signup";
      return;
    }
    if (planKey === "enterprise") {
      window.location.href = "mailto:enterprise@beliefmetrics.com";
      return;
    }
    
    createCheckout.mutate(
      { data: { plan: planKey as "researcher" | "pro" } },
      {
        onSuccess: (data) => {
          window.location.href = data.url;
        }
      }
    );
  };

  return (
    <PublicLayout>
      <div className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">Select the tier that matches your research needs.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TIERS.map((tier) => (
            <Card key={tier.name} className="flex flex-col border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold font-display">
                  {tier.price}
                  {tier.period && <span className="ml-1 text-xl font-medium text-muted-foreground">{tier.period}</span>}
                </div>
                <CardDescription className="mt-4">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {tier.planKey === null ? (
                  <Link href="/signup" className="w-full">
                    <Button className="w-full" variant="outline">Start for free</Button>
                  </Link>
                ) : tier.planKey === "enterprise" ? (
                  <Button className="w-full" variant="outline" onClick={() => handleCheckout(tier.planKey)}>Contact Sales</Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={tier.planKey === "pro" ? "default" : "outline"}
                    onClick={() => handleCheckout(tier.planKey)}
                    disabled={createCheckout.isPending}
                  >
                    {createCheckout.isPending ? "Redirecting..." : `Subscribe to ${tier.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
