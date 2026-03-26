import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Users,
  RefreshCw,
  Target,
  BarChart3,
  Mail,
  Store,
  ChevronDown,
  AlertTriangle,
  DollarSign,
  XCircle,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AuditResult {
  summary: string;
  issues: string[];
  opportunities: string[];
  revenue_lift: string;
  message: string;
  estimated_lost_customers: number;
  projected_recovery_value: string;
  churn_risk: "Low" | "Medium" | "High" | "Critical";
  store_signals: {
    has_email_capture: boolean;
    has_discount_offers: boolean;
    has_cart_recovery: boolean;
    product_count_estimate: string;
  };
}

export default function Recover() {
  const [storeUrl, setStoreUrl] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditSubmitted, setAuditSubmitted] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const checkoutMutation = trpc.audit.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => {
      setCheckoutLoading(false);
      toast.error(err.message || "Could not start checkout. Please try again.");
    },
  });

  const checkout299Mutation = trpc.audit.createCheckoutSession299.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (err) => {
      setCheckoutLoading(false);
      toast.error(err.message || "Could not start checkout. Please try again.");
    },
  });

  const handleActivate = () => {
    if (!workEmail || !storeUrl) {
      toast.error("Please run the audit first to activate.");
      return;
    }
    setCheckoutLoading(true);
    checkoutMutation.mutate({ email: workEmail, storeUrl });
  };

  const handleActivate299 = () => {
    if (!workEmail || !storeUrl) {
      scrollToAudit();
      return;
    }
    setCheckoutLoading(true);
    checkout299Mutation.mutate({ email: workEmail, storeUrl });
  };

  const auditMutation = trpc.audit.generate.useMutation({
    onSuccess: (data) => {
      setAuditResult(data.audit);
      setAuditSubmitted(true);
      setTimeout(() => {
        document.getElementById("audit-results")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    },
    onError: (err) => {
      toast.error(err.message || "Audit failed. Please try again.");
    },
  });

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmail || !storeUrl) {
      toast.error("Please enter both your store URL and email address.");
      return;
    }
    auditMutation.mutate({ storeUrl, email: workEmail });
  };

  const churnRiskColor = (risk: string) => {
    if (risk === "Critical") return "text-red-400 border-red-500/40 bg-red-500/10";
    if (risk === "High") return "text-orange-400 border-orange-500/40 bg-orange-500/10";
    if (risk === "Medium") return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
    return "text-green-400 border-green-500/40 bg-green-500/10";
  };

  const churnRiskIcon = (risk: string) => {
    if (risk === "Critical" || risk === "High") return <AlertTriangle className="h-4 w-4" />;
    if (risk === "Medium") return <Zap className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const scrollToAudit = () => {
    document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── NAVIGATION ─── */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/">
                <img src="/logo.png" alt="Influxity.ai" className="h-10 w-auto" />
              </a>
              <span className="hidden sm:flex items-center gap-2">
                <span className="text-border/60 text-sm">/</span>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold border-primary/40 text-primary bg-primary/10 px-2 py-0.5"
                >
                  Recover
                </Badge>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={scrollToHowItWorks}
                className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </button>
              <Button
                onClick={scrollToAudit}
                className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold text-sm px-4 py-2"
              >
                Get Free Audit
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">

            {/* ── LEFT: Copy ── */}
            <div className="flex flex-col">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 mb-8 w-fit">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-medium text-red-400">🔥 Limited free audits this week — 7 spots remaining</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your customers aren't gone.{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  You just never brought them back.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
                Most Shopify brands lose{" "}
                <span className="text-yellow-400 font-semibold">20–40%</span>{" "}
                of customers after their first purchase.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                We identify exactly who didn't return — and show you how to win them back in{" "}
                <span className="text-yellow-400 font-semibold">30 seconds</span>.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <Button
                  onClick={scrollToAudit}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-bold px-8 py-4 text-base w-full sm:w-auto shadow-lg shadow-yellow-500/25"
                >
                  Reveal My Lost Revenue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Micro trust */}
              <p className="text-sm text-muted-foreground">
                No login&nbsp;•&nbsp;No integrations&nbsp;•&nbsp;Takes 30 seconds
              </p>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-border/30">
                {[
                  { value: "$5K–$50K", label: "Recoverable per store", icon: <DollarSign className="h-4 w-4 text-yellow-400" /> },
                  { value: "20–40%", label: "Customers lost silently", icon: <Users className="h-4 w-4 text-purple-400" /> },
                  { value: "30 sec", label: "Free audit, no setup", icon: <Zap className="h-4 w-4 text-yellow-400" /> },
                ].map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="flex items-center gap-1.5 mb-1">{stat.icon}<span className="text-xl font-bold text-foreground">{stat.value}</span></div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Audit UI Mock ── */}
            <div className="relative">
              <div className="bg-card/80 backdrop-blur-sm border border-yellow-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40">
                {/* Mock browser bar */}
                <div className="bg-background/90 border-b border-border/40 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="flex-1 mx-4 bg-border/30 rounded px-3 py-1 text-xs text-muted-foreground">influxity.ai/recover — Churn Audit Results</div>
                </div>

                {/* Mock audit results */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Churn Audit Results</span>
                    <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">⚠ High Risk</span>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-background/60 border border-border/40 rounded-xl p-4">
                      <div className="text-xs text-muted-foreground mb-1">At-Risk Customers</div>
                      <div className="text-2xl font-bold text-yellow-400">28%</div>
                      <div className="text-xs text-muted-foreground">320 buyers</div>
                    </div>
                    <div className="bg-background/60 border border-border/40 rounded-xl p-4">
                      <div className="text-xs text-muted-foreground mb-1">Recoverable Revenue</div>
                      <div className="text-2xl font-bold text-yellow-400">$18,750</div>
                      <div className="text-xs text-muted-foreground">90 days silent</div>
                    </div>
                  </div>

                  {/* Win-back items */}
                  <div className="space-y-2 mb-5">
                    {[
                      { label: "Win-Back Email Sequence", status: "Ready", color: "text-green-400" },
                      { label: "SMS Recovery Script", status: "Ready", color: "text-green-400" },
                      { label: "High-Risk Segment Export", status: "Ready", color: "text-green-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-background/40 border border-border/30 rounded-lg px-3 py-2">
                        <span className="text-xs text-foreground">{item.label}</span>
                        <span className={`text-xs font-semibold ${item.color}`}>{item.status} →</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA inside mock */}
                  <button
                    onClick={scrollToAudit}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold text-sm py-3 rounded-lg hover:from-yellow-600 hover:to-yellow-500 transition-all"
                  >
                    Run My Free Audit Now →
                  </button>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Free This Week
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── OPPORTUNITY SNAPSHOT PANEL ─── */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Your Recovery Opportunity Looks Like
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Here's a sample of what the Influxity Recover audit surfaces for a typical Shopify store.
              </p>
            </div>

            {/* Dashboard Mock */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl">
              {/* Mock Header Bar */}
              <div className="bg-background/80 border-b border-border/40 px-6 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">influxity.ai/recover — Audit Preview</span>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Metric Cards */}
                  {[
                    {
                      label: "Estimated Inactive Segment",
                      value: "842",
                      sub: "customers not seen in 90+ days",
                      color: "text-purple-400",
                      border: "border-purple-500/30",
                    },
                    {
                      label: "Projected Revenue Lift",
                      value: "2–8%",
                      sub: "benchmark-based estimate",
                      color: "text-yellow-400",
                      border: "border-yellow-500/30",
                    },
                    {
                      label: "Recovery Campaign Ready",
                      value: "< 24 hrs",
                      sub: "from audit to first send",
                      color: "text-green-400",
                      border: "border-green-500/30",
                    },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className={`bg-background/60 border ${m.border} rounded-xl p-5`}
                    >
                      <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{m.label}</div>
                      <div className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</div>
                      <div className="text-xs text-muted-foreground">{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Sample Recovery Message */}
                <div className="bg-background/60 border border-border/40 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Sample Recovery Message</span>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary ml-auto">
                      AI-Generated
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">Subject:</span> We saved something for you
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                    "Hi [First Name], it's been a while — and we noticed. We've kept your favourites in stock and
                    put together something just for you. No pressure, just a reminder we're here when you're ready."
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={scrollToAudit}
                    className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold flex-1"
                  >
                    Activate for $99
                  </Button>
                  <Button
                    onClick={scrollToAudit}
                    variant="outline"
                    className="border-border/60 flex-1"
                  >
                    Pay Only on Results
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Illustrative preview. Actual results vary by store, audience, and campaign execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Three steps from audit to revenue recovery. No complex integrations. No disruption to your existing brand.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: <Store className="h-7 w-7 text-purple-400" />,
                  title: "Connect Your Store",
                  body:
                    "Share your store URL and we run a benchmark-based analysis of your customer base. No invasive access required for the initial audit.",
                  accent: "border-purple-500/30",
                },
                {
                  step: "02",
                  icon: <BarChart3 className="h-7 w-7 text-yellow-400" />,
                  title: "Score Churn Risk",
                  body:
                    "Influxity Recover identifies inactive segments, surfaces at-risk customers, and frames realistic recovery opportunities based on proven retention benchmarks.",
                  accent: "border-yellow-500/30",
                },
                {
                  step: "03",
                  icon: <RefreshCw className="h-7 w-7 text-purple-400" />,
                  title: "Trigger Recovery",
                  body:
                    "Launch AI-personalized win-back campaigns in under 24 hours. Brand-safe messaging, outcome-first design, and zero disruption to your existing customer relationships.",
                  accent: "border-purple-500/30",
                },
              ].map((s, i) => (
                <div key={i} className={`bg-card border ${s.accent} rounded-2xl p-7 relative`}>
                  <div className="absolute top-5 right-5 text-4xl font-black text-border/20">{s.step}</div>
                  <div className="mb-4">{s.icon}</div>
                  <h3 className="text-lg font-bold mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU GET ─── */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What You Get
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                No integrations. No setup. Just results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
              {[
                {
                  icon: <Target className="h-6 w-6 text-purple-400" />,
                  title: "At-Risk Customer Segments",
                  body: "See exactly which customers are about to churn — segmented by behavior, purchase recency, and risk level.",
                },
                {
                  icon: <DollarSign className="h-6 w-6 text-yellow-400" />,
                  title: "Revenue Recovery Projection",
                  body: "Your personalized dollar estimate of recoverable revenue sitting in your inactive customer base right now.",
                },
                {
                  icon: <Mail className="h-6 w-6 text-purple-400" />,
                  title: "Ready-to-Send Win-Back Campaigns",
                  body: "Pre-built, AI-personalized recovery messages you can deploy immediately — no copywriting, no guesswork.",
                },
                {
                  icon: <Zap className="h-6 w-6 text-yellow-400" />,
                  title: "24-Hour Execution Plan",
                  body: "A step-by-step action plan to launch your first recovery campaign within 24 hours of completing the audit.",
                },
              ].map((c, i) => (
                <div key={i} className="bg-card border border-border/40 rounded-2xl p-6 flex gap-4">
                  <div className="shrink-0 mt-1">{c.icon}</div>
                  <div>
                    <h3 className="font-bold mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── OFFER STACK ─── */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Choose Your Path</h2>
              <p className="text-muted-foreground">Start free. Upgrade when you're ready to execute.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  tier: "Free",
                  price: "$0",
                  label: "AI Retention Audit",
                  features: ["At-risk customer segments", "Revenue recovery estimate", "Sample win-back message", "Churn risk score"],
                  cta: "Run Free Audit",
                  accent: "border-border/60",
                  highlight: false,
                },
                {
                  tier: "$99",
                  price: "$99",
                  label: "Quick Win-Back Setup",
                  features: ["Everything in Free", "Full recovery campaign setup", "Personalized messaging sequences", "24-hour execution plan"],
                  cta: "Activate for $99",
                  accent: "border-yellow-500/50",
                  highlight: true,
                },
                {
                  tier: "$299",
                  price: "$299",
                  label: "Full Retention System",
                  features: ["Everything in $99", "Complete lifecycle segmentation", "Monthly retention management", "Ongoing optimization"],
                  cta: "Activate for $299",
                  accent: "border-purple-500/50",
                  highlight: false,
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`bg-card border ${plan.accent} rounded-2xl p-7 relative ${
                    plan.highlight ? "ring-2 ring-yellow-500/40" : ""
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{plan.tier}</div>
                  <div className="text-3xl font-black text-foreground mb-1">{plan.price}</div>
                  <div className="text-sm font-semibold text-primary mb-5">{plan.label}</div>
                  <ul className="space-y-2 mb-7">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={plan.tier === "$299" ? handleActivate299 : scrollToAudit}
                    className={`w-full font-semibold ${
                      plan.highlight
                        ? "bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white"
                        : "bg-card border border-border/60 text-foreground hover:bg-background"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              Most stores start with the $99 setup. When you want us to fully map and implement your retention system, that's the $299 tier.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FREE RETENTION AUDIT FORM ─── */}
      <section id="audit" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/8 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto">
            <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-2xl">
              {/* ─── AUDIT RESULTS ─── */}
              {auditSubmitted && auditResult ? (
                <div id="audit-results">
                  <div className="text-center mb-6">
                    <Badge variant="outline" className="mb-3 border-primary/30 text-primary bg-primary/10 px-3 py-1">
                      Your Store Audit
                    </Badge>
                    <h2 className="text-2xl font-bold mb-1">Audit Complete</h2>
                    <p className="text-sm text-muted-foreground">{storeUrl}</p>
                  </div>
                  {/* Churn Risk */}
                  <div className={`flex items-center justify-center gap-2 border rounded-xl px-4 py-3 mb-6 ${churnRiskColor(auditResult.churn_risk)}`}>
                    {churnRiskIcon(auditResult.churn_risk)}
                    <span className="font-bold text-sm">{auditResult.churn_risk} Churn Risk</span>
                  </div>
                  {/* Revenue Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-background/60 border border-border/40 rounded-xl p-4 text-center">
                      <DollarSign className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                      <div className="text-lg font-black text-yellow-400">{auditResult.projected_recovery_value}</div>
                      <div className="text-xs text-muted-foreground">Projected Recovery</div>
                    </div>
                    <div className="bg-background/60 border border-border/40 rounded-xl p-4 text-center">
                      <Users className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                      <div className="text-lg font-black text-purple-400">{auditResult.estimated_lost_customers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Est. Inactive Customers</div>
                    </div>
                  </div>
                  {/* Summary */}
                  <div className="bg-background/60 border border-border/40 rounded-xl p-4 mb-5">
                    <p className="text-sm text-foreground leading-relaxed">{auditResult.summary}</p>
                  </div>
                  {/* Issues */}
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-400" /> Key Gaps Identified
                    </h4>
                    <ul className="space-y-2">
                      {auditResult.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-red-400 mt-0.5 shrink-0">✗</span>{issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Opportunities */}
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" /> Recovery Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {auditResult.opportunities.map((opp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-green-400 mt-0.5 shrink-0">✓</span>{opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Sample Message */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                    <div className="text-xs font-semibold text-purple-400 mb-2">Sample AI Recovery Message</div>
                    <p className="text-sm text-foreground italic leading-relaxed">{auditResult.message}</p>
                  </div>
                  {/* Revenue Lift */}
                  <div className="text-center mb-6">
                    <span className="text-xs text-muted-foreground">Estimated Revenue Lift: </span>
                    <span className="text-sm font-bold text-yellow-400">{auditResult.revenue_lift}</span>
                  </div>
                  {/* CTAs */}
                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <p className="text-center text-sm font-semibold text-foreground mb-4">Ready to activate your recovery system?</p>
                    <Button
                      onClick={handleActivate}
                      disabled={checkoutLoading || checkoutMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold py-3 text-base"
                    >
                      {checkoutLoading || checkoutMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Opening checkout...
                        </span>
                      ) : (
                        <>
                          Activate Recovery System — $99
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleActivate}
                      disabled={checkoutLoading || checkoutMutation.isPending}
                      variant="outline"
                      className="w-full border-border/60 text-foreground hover:bg-card py-3 text-base"
                    >
                      Pay Only on Results
                    </Button>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      Audit powered by Influxity AI. Results are benchmark-based estimates.
                    </p>
                  </div>
                </div>
              ) : (
                /* ─── AUDIT FORM ─── */
                <>
                  <div className="text-center mb-8">
                    <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 px-3 py-1">
                      Free AI Retention Audit
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Find Your Lost Revenue</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Drop your store URL. In 30 seconds, we'll show you who's churning, how much it's costing you, and exactly what to send to win them back.
                    </p>
                  </div>
                  <form onSubmit={handleAuditSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Store URL</label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="yourstore.myshopify.com"
                          value={storeUrl}
                          onChange={(e) => setStoreUrl(e.target.value)}
                          required
                          className="pl-10 bg-background/60 border-border/60 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@yourcompany.com"
                          value={workEmail}
                          onChange={(e) => setWorkEmail(e.target.value)}
                          required
                          className="pl-10 bg-background/60 border-border/60 focus:border-primary"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={auditMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold py-3 text-base"
                    >
                      {auditMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing your store...
                        </span>
                      ) : (
                        <>
                          Run My Free AI Audit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                    No login. No integrations. Just your numbers. Results in 30 seconds.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/40 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a href="/">
                <img src="/logo.png" alt="Influxity.ai" className="h-8 w-auto" />
              </a>
              <span className="text-xs text-muted-foreground">
                Influxity Recover is a product of{" "}
                <a href="/" className="text-primary hover:underline">
                  Influxity.ai
                </a>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Influxity.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
