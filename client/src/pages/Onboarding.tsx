import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Store,
  Mail,
  User,
  Phone,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Your Business", icon: <Store className="h-5 w-5" /> },
  { id: 2, title: "Your Goals", icon: <TrendingUp className="h-5 w-5" /> },
  { id: 3, title: "Connect", icon: <Zap className="h-5 w-5" /> },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [complete, setComplete] = useState(false);

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [platform, setPlatform] = useState("Shopify");

  // Step 2 fields
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("Recover inactive customers");
  const [timeline, setTimeline] = useState("ASAP");

  // Step 3 fields
  const [espPlatform, setEspPlatform] = useState("Klaviyo");
  const [smsPlatform, setSmsPlatform] = useState("None");
  const [notes, setNotes] = useState("");

  const newsletterSubscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setComplete(true);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleFinalSubmit = () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    newsletterSubscribe.mutate({
      email,
      source: `onboarding|store:${storeUrl}|platform:${platform}|goal:${primaryGoal}|esp:${espPlatform}|revenue:${monthlyRevenue}`,
    });
  };

  if (complete) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="bg-card border border-border/60 rounded-2xl p-10 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 px-3 py-1">
              You're In
            </Badge>
            <h1 className="text-3xl font-bold mb-3">Welcome to Influxity Recover</h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Your onboarding is complete, {name || "friend"}. Our team will review your store details and have your
              first recovery campaign ready within <span className="text-foreground font-semibold">24–48 hours</span>.
              Check <span className="text-primary">{email}</span> for next steps.
            </p>
            <div className="grid grid-cols-1 gap-3 mb-8">
              {[
                { icon: <BarChart3 className="h-4 w-4 text-purple-400" />, text: "Your store audit is being processed" },
                { icon: <Zap className="h-4 w-4 text-yellow-400" />, text: "Recovery campaigns are being configured" },
                { icon: <Mail className="h-4 w-4 text-purple-400" />, text: "Onboarding summary sent to your email" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-background/60 border border-border/40 rounded-xl px-4 py-3">
                  {item.icon}
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => window.location.href = "/"}
              className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold py-3"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                  Onboarding
                </Badge>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Secure Setup</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── PROGRESS BAR ─── */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-2 ${step >= s.id ? "text-foreground" : "text-muted-foreground"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                        step > s.id
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : step === s.id
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-background border-border/40 text-muted-foreground"
                      }`}
                    >
                      {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 ${step > s.id ? "bg-green-500/40" : "bg-border/40"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="w-full bg-border/20 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-purple-600 to-yellow-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── FORM BODY ─── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">

            {/* ─── STEP 1: Your Business ─── */}
            {step === 1 && (
              <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 px-3 py-1">
                    Step 1 of 3
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">Tell Us About Your Business</h2>
                  <p className="text-muted-foreground text-sm">
                    This helps us configure your recovery system accurately from day one.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Sean Blackwell"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-background/60 border-border/60 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 bg-background/60 border-border/60 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Store URL</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="yourstore.myshopify.com"
                        value={storeUrl}
                        onChange={(e) => setStoreUrl(e.target.value)}
                        className="pl-10 bg-background/60 border-border/60 focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">E-Commerce Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {["Shopify", "WooCommerce", "BigCommerce", "Magento", "Custom / Other"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!email) { toast.error("Please enter your email address."); return; }
                    setStep(2);
                  }}
                  className="w-full mt-8 bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold py-3 text-base"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ─── STEP 2: Your Goals ─── */}
            {step === 2 && (
              <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 px-3 py-1">
                    Step 2 of 3
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">What Are Your Goals?</h2>
                  <p className="text-muted-foreground text-sm">
                    This shapes how we prioritize your recovery campaigns.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Estimated Monthly Revenue</label>
                    <select
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(e.target.value)}
                      className="w-full bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">Select range...</option>
                      {["Under $10K", "$10K – $50K", "$50K – $250K", "$250K – $1M", "Over $1M"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Primary Goal</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        "Recover inactive customers",
                        "Reduce cart abandonment",
                        "Increase repeat purchase rate",
                        "Grow email subscriber list",
                        "All of the above",
                      ].map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setPrimaryGoal(goal)}
                          className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                            primaryGoal === goal
                              ? "border-primary/60 bg-primary/10 text-foreground font-medium"
                              : "border-border/40 bg-background/40 text-muted-foreground hover:border-border/60"
                          }`}
                        >
                          {primaryGoal === goal ? (
                            <span className="text-primary mr-2">✓</span>
                          ) : (
                            <span className="text-muted-foreground mr-2">○</span>
                          )}
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Desired Timeline</label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {["ASAP", "Within 1 week", "Within 1 month", "Just exploring"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-border/60 text-foreground hover:bg-card py-3"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold py-3"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Connect ─── */}
            {step === 3 && (
              <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10 px-3 py-1">
                    Step 3 of 3
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">Connect Your Stack</h2>
                  <p className="text-muted-foreground text-sm">
                    Tell us what tools you use so we can integrate seamlessly.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email Service Provider</label>
                    <select
                      value={espPlatform}
                      onChange={(e) => setEspPlatform(e.target.value)}
                      className="w-full bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {["Klaviyo", "Mailchimp", "ActiveCampaign", "Drip", "Omnisend", "Beehiiv", "None / Other"].map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">SMS Platform (if any)</label>
                    <select
                      value={smsPlatform}
                      onChange={(e) => setSmsPlatform(e.target.value)}
                      className="w-full bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {["None", "Klaviyo SMS", "Postscript", "Attentive", "SMSBump", "Other"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Anything else we should know?</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special requirements, integrations, questions..."
                      rows={4}
                      className="w-full bg-background/60 border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Summary Preview */}
                <div className="mt-6 bg-background/60 border border-border/40 rounded-xl p-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Setup Summary</div>
                  <div className="space-y-1.5 text-sm">
                    {[
                      { label: "Store", value: storeUrl || "Not provided" },
                      { label: "Platform", value: platform },
                      { label: "Goal", value: primaryGoal },
                      { label: "Revenue", value: monthlyRevenue || "Not specified" },
                      { label: "ESP", value: espPlatform },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-border/60 text-foreground hover:bg-card py-3"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={newsletterSubscribe.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold py-3"
                  >
                    {newsletterSubscribe.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        Complete Onboarding
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Your information is encrypted and never shared with third parties.
                </p>
              </div>
            )}
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
                A product of{" "}
                <a href="/" className="text-primary hover:underline">Influxity.ai</a>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Influxity.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
