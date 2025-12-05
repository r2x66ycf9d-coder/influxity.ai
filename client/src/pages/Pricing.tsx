import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Pricing() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: data => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");
      }
      setLoadingPlan(null);
    },
    onError: () => {
      toast.error("Failed to create checkout session");
      setLoadingPlan(null);
    },
  });

  const handleSubscribe = (plan: "STARTER" | "PROFESSIONAL") => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingPlan(plan);
    createCheckout.mutate({ plan });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">All plans include a 14-day free trial</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold">$99</div>
              <div className="text-muted-foreground">/month</div>
            </div>
            <Button
              className="w-full mb-6"
              variant="outline"
              onClick={() => handleSubscribe("STARTER")}
              disabled={loadingPlan === "STARTER"}
            >
              {loadingPlan === "STARTER" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Start Free Trial
            </Button>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">1 location/store</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Basic automation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Email support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">14-day free trial</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Cancel anytime</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 relative border-2 border-primary">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-muted-foreground">Most popular for growing businesses</p>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold">$299</div>
              <div className="text-muted-foreground">/month</div>
            </div>
            <Button
              className="w-full mb-6"
              onClick={() => handleSubscribe("PROFESSIONAL")}
              disabled={loadingPlan === "PROFESSIONAL"}
            >
              {loadingPlan === "PROFESSIONAL" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Start Free Trial
            </Button>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">5 locations/stores</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">All features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Phone support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Dedicated success manager</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">14-day free trial</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">30-day money-back guarantee</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8 relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground">For large-scale operations</p>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold">Custom</div>
              <div className="text-muted-foreground">pricing</div>
            </div>
            <Button className="w-full mb-6" variant="outline" onClick={() => (window.location.href = getLoginUrl())}>
              Contact Sales
            </Button>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Unlimited locations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">24/7 dedicated support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">Custom features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">SLA guarantee</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">White-label options</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
