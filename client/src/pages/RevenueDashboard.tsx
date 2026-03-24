/**
 * Revenue Dashboard — Sean's Private Command Center
 * Shows live MRR, subscriber counts, affiliate clicks, and blog traffic.
 * Accessible at /revenue (protected by login).
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DollarSign,
  Users,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  Zap,
  Mail,
} from "lucide-react";

interface RevenueMetrics {
  mrr: number;
  subscribers: { starter: number; professional: number; enterprise: number };
  totalSubscribers: number;
  affiliateClicks: number;
  emailSubscribers: number;
  stripeBalance: number;
}

export default function RevenueDashboard() {
  const { data: user } = trpc.auth.me.useQuery();
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    mrr: 0,
    subscribers: { starter: 0, professional: 0, enterprise: 0 },
    totalSubscribers: 0,
    affiliateClicks: 0,
    emailSubscribers: 0,
    stripeBalance: 0,
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stripeData, refetch } = trpc.stripe.getRevenueMetrics.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  useEffect(() => {
    if (stripeData) {
      setMetrics(stripeData as RevenueMetrics);
      setLastRefresh(new Date());
    }
  }, [stripeData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    setLastRefresh(new Date());
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Revenue Dashboard</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your revenue metrics.</p>
          <Button onClick={() => (window.location.href = "/login")}>Log In</Button>
        </Card>
      </div>
    );
  }

  const projectedAnnual = metrics.mrr * 12;
  const mrrGrowthTarget = 10000;
  const mrrProgress = Math.min((metrics.mrr / mrrGrowthTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Revenue Command Center</h1>
            <p className="text-muted-foreground mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 60s
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* MRR Progress Bar */}
        <Card className="p-6 mb-8 border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Progress to $10K MRR Goal
              </p>
              <p className="text-4xl font-bold text-primary mt-1">
                ${metrics.mrr.toLocaleString()}<span className="text-lg text-muted-foreground font-normal">/mo</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Projected Annual</p>
              <p className="text-2xl font-bold">${projectedAnnual.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${mrrProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {mrrProgress.toFixed(1)}% of $10,000/month goal ·{" "}
            ${(mrrGrowthTarget - metrics.mrr).toLocaleString()} remaining
          </p>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">MRR</span>
            </div>
            <p className="text-2xl font-bold">${metrics.mrr.toLocaleString()}</p>
            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" /> Live Stripe data
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Subscribers</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalSubscribers}</p>
            <p className="text-xs text-muted-foreground mt-1">Paying customers</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Affiliate Clicks</span>
            </div>
            <p className="text-2xl font-bold">{metrics.affiliateClicks}</p>
            <p className="text-xs text-muted-foreground mt-1">Potential commissions</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Email List</span>
            </div>
            <p className="text-2xl font-bold">{metrics.emailSubscribers}</p>
            <p className="text-xs text-muted-foreground mt-1">Newsletter subscribers</p>
          </Card>
        </div>

        {/* Subscriber Breakdown */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <Badge variant="secondary" className="mb-3">Starter — $49/mo</Badge>
            <p className="text-3xl font-bold">{metrics.subscribers.starter}</p>
            <p className="text-muted-foreground text-sm mt-1">
              = ${(metrics.subscribers.starter * 49).toLocaleString()}/mo
            </p>
          </Card>
          <Card className="p-6 border-primary/40">
            <Badge className="mb-3">Professional — $149/mo</Badge>
            <p className="text-3xl font-bold">{metrics.subscribers.professional}</p>
            <p className="text-muted-foreground text-sm mt-1">
              = ${(metrics.subscribers.professional * 149).toLocaleString()}/mo
            </p>
          </Card>
          <Card className="p-6">
            <Badge variant="outline" className="mb-3">Enterprise — $499/mo</Badge>
            <p className="text-3xl font-bold">{metrics.subscribers.enterprise}</p>
            <p className="text-muted-foreground text-sm mt-1">
              = ${(metrics.subscribers.enterprise * 499).toLocaleString()}/mo
            </p>
          </Card>
        </div>

        {/* Revenue Streams Status */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Passive Income Streams — Live Status
          </h2>
          <div className="space-y-3">
            {[
              { name: "SaaS Subscriptions (Stripe)", status: "LIVE", color: "text-green-500", detail: "Payments processing 24/7" },
              { name: "Affiliate Blog (6 articles)", status: "LIVE", color: "text-green-500", detail: "SEO indexing in progress" },
              { name: "Email Capture Funnel", status: "LIVE", color: "text-green-500", detail: "Capturing leads on every page" },
              { name: "Newsletter (Beehiiv)", status: "PENDING ENV KEY", color: "text-yellow-500", detail: "Add BEEHIIV_API_KEY to activate" },
              { name: "Weekly AI Blog Auto-Generation", status: "SCHEDULED", color: "text-blue-500", detail: "Runs every Monday 9AM" },
              { name: "Weekly Revenue Report to Gmail", status: "SCHEDULED", color: "text-blue-500", detail: "Runs every Sunday 8PM" },
            ].map(stream => (
              <div key={stream.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{stream.name}</p>
                  <p className="text-xs text-muted-foreground">{stream.detail}</p>
                </div>
                <Badge
                  variant={stream.status === "LIVE" ? "default" : "secondary"}
                  className={stream.color}
                >
                  {stream.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" onClick={() => window.open("https://dashboard.stripe.com", "_blank")}>
              <DollarSign className="w-4 h-4 mr-2" /> Stripe Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.open("https://app.beehiiv.com", "_blank")}>
              <Mail className="w-4 h-4 mr-2" /> Beehiiv
            </Button>
            <Button variant="outline" onClick={() => window.open("https://search.google.com/search-console", "_blank")}>
              <TrendingUp className="w-4 h-4 mr-2" /> Google Search Console
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/blog")}>
              <ExternalLink className="w-4 h-4 mr-2" /> View Blog
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
