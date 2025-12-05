import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Star,
  Check,
  ArrowRight,
  Mail,
  FileText,
  BarChart3,
  MessageSquare,
  Lightbulb,
  Target,
} from "lucide-react";
import { getLoginUrl } from "@/const";

type Industry = "restaurants" | "ecommerce" | "service";

export default function Home() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>("restaurants");
  const [email, setEmail] = useState("");

  const industryData = {
    restaurants: {
      icon: "🍽️",
      title: "Restaurants",
      savings: {
        labor: "$18,000/year",
        waste: "$6,480/year",
        revenue: "+$31,800/year",
      },
      description: "Reduce labor costs by 10% through smart scheduling and staff optimization",
      wasteDesc: "Reduce inventory waste by 30% with AI-powered demand forecasting",
      revenueDesc: "Increase revenue by $2,650/week through pricing optimization and upselling",
    },
    ecommerce: {
      icon: "🛒",
      title: "E-Commerce",
      savings: {
        labor: "$24,000/year",
        waste: "$8,400/year",
        revenue: "+$42,000/year",
      },
      description: "Automate customer service and reduce support costs by 40%",
      wasteDesc: "Eliminate cart abandonment with AI-powered recovery campaigns",
      revenueDesc: "Boost conversion rates by 28% with personalized recommendations",
    },
    service: {
      icon: "🔧",
      title: "Service Business",
      savings: {
        labor: "$21,600/year",
        waste: "$7,200/year",
        revenue: "+$36,000/year",
      },
      description: "Automate scheduling and reduce administrative overhead by 35%",
      wasteDesc: "Optimize route planning and reduce fuel costs by 25%",
      revenueDesc: "Increase bookings by 30% with AI-powered lead qualification",
    },
  };

  const currentIndustry = industryData[selectedIndustry];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Influxity" className="h-10 w-auto" />
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#pricing" className="text-sm hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-sm hover:text-primary transition-colors">
                FAQ
              </a>
              <Button onClick={() => (window.location.href = getLoginUrl())} variant="default">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Large Centered Logo */}
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="Influxity" className="w-64 md:w-80 h-auto" />
            </div>
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Join 500+ Businesses Saving Time & Money
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Save $24,000/Year and 20+ Hours/Week{" "}
              <span className="text-primary">Without Hiring</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered automation for restaurants, e-commerce stores, and service businesses. Increase revenue, reduce costs, and
              free up your team to focus on growth.
            </p>
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" size="lg">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
              </p>
            </form>
            <div className="flex items-center justify-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-sm">30-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Selector */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Industry</h2>
              <p className="text-lg text-muted-foreground">See exactly how much you can save with Influxity.ai</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              {(["restaurants", "ecommerce", "service"] as Industry[]).map(industry => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedIndustry === industry
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className="text-4xl mb-3">{industryData[industry].icon}</div>
                  <div className="font-semibold text-lg">{industryData[industry].title}</div>
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-2 border-primary/20">
                <div className="text-primary mb-2">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="text-sm text-muted-foreground mb-2">Save on Labor</div>
                <div className="text-3xl font-bold mb-3">{currentIndustry.savings.labor}</div>
                <p className="text-sm text-muted-foreground">{currentIndustry.description}</p>
              </Card>
              <Card className="p-6 border-2 border-primary/20">
                <div className="text-primary mb-2">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="text-sm text-muted-foreground mb-2">Cut Waste</div>
                <div className="text-3xl font-bold mb-3">{currentIndustry.savings.waste}</div>
                <p className="text-sm text-muted-foreground">{currentIndustry.wasteDesc}</p>
              </Card>
              <Card className="p-6 border-2 border-primary/20">
                <div className="text-primary mb-2">
                  <Target className="w-8 h-8" />
                </div>
                <div className="text-sm text-muted-foreground mb-2">Boost Revenue</div>
                <div className="text-3xl font-bold mb-3 text-primary">{currentIndustry.savings.revenue}</div>
                <p className="text-sm text-muted-foreground">{currentIndustry.revenueDesc}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature is driven by artificial intelligence to automate your business and drive growth
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <MessageSquare className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI Chat Assistant</h3>
              <p className="text-muted-foreground">
                Multi-turn conversations with context awareness. Get instant answers and insights from your AI business advisor.
              </p>
            </Card>
            <Card className="p-6">
              <Mail className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Email Generation</h3>
              <p className="text-muted-foreground">
                Generate sales, support, marketing, and follow-up emails instantly. AI-powered copy that converts.
              </p>
            </Card>
            <Card className="p-6">
              <FileText className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Content Creation</h3>
              <p className="text-muted-foreground">
                Create email campaigns, landing pages, social media calendars, blog posts, and more with AI.
              </p>
            </Card>
            <Card className="p-6">
              <BarChart3 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Data Analysis</h3>
              <p className="text-muted-foreground">
                AI-powered insights on sales, customer behavior, operational efficiency, and ROI calculations.
              </p>
            </Card>
            <Card className="p-6">
              <Lightbulb className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Get AI-driven growth strategies, competitive analysis, and actionable business recommendations.
              </p>
            </Card>
            <Card className="p-6">
              <Sparkles className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Sales Copy AI</h3>
              <p className="text-muted-foreground">
                Generate compelling headlines, CTAs, product descriptions, and sales copy that drives conversions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 relative">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold">$99</div>
                <div className="text-muted-foreground">/month</div>
              </div>
              <Button className="w-full mb-6" variant="outline" onClick={() => (window.location.href = getLoginUrl())}>
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
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-muted-foreground">Most popular for growing businesses</p>
              </div>
              <div className="mb-6">
                <div className="text-4xl font-bold">$299</div>
                <div className="text-muted-foreground">/month</div>
              </div>
              <Button className="w-full mb-6" onClick={() => (window.location.href = getLoginUrl())}>
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
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Growing Businesses</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-lg mb-6">
                "We increased revenue by $31,800/year in the first month. Influxity.ai paid for itself in 2 weeks."
              </p>
              <div>
                <div className="font-semibold">John Smith</div>
                <div className="text-sm text-muted-foreground">The Italian Place • Restaurant</div>
                <div className="text-sm text-primary font-semibold mt-2">+$2,650/week revenue</div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-lg mb-6">
                "Our conversion rate jumped from 2.1% to 2.7%. That's $600,000 in additional annual revenue."
              </p>
              <div>
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-muted-foreground">StyleHub • E-Commerce</div>
                <div className="text-sm text-primary font-semibold mt-2">+28% conversion rate</div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-lg mb-6">
                "We're scheduling 40% more jobs and acquiring 30% more customers. Best investment we've made."
              </p>
              <div>
                <div className="font-semibold">Mike Rodriguez</div>
                <div className="text-sm text-muted-foreground">Rodriguez Plumbing • Service Business</div>
                <div className="text-sm text-primary font-semibold mt-2">+$150,000/year revenue</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-card/50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left">How long does setup take?</AccordionTrigger>
                <AccordionContent>
                  Setup takes about 5 minutes. Just sign up, connect your business tools, and we'll guide you through the rest. Most
                  customers are running automations within 24 hours.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left">What if it doesn't work for my business?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day money-back guarantee. If you're not satisfied with the results, just let us know and we'll refund
                  your money. No questions asked.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left">Can I cancel anytime?</AccordionTrigger>
                <AccordionContent>
                  Yes, absolutely. There are no long-term contracts or cancellation fees. You can cancel your subscription anytime with
                  one click.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left">Do you offer customer support?</AccordionTrigger>
                <AccordionContent>
                  Yes! Starter plan customers get email support. Professional and Enterprise customers get phone support and a dedicated
                  success manager to help you maximize results.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left">What tools does Influxity.ai integrate with?</AccordionTrigger>
                <AccordionContent>
                  We integrate with 500+ popular business tools including Stripe, Shopify, HubSpot, Slack, Gmail, and more. If your tool
                  isn't listed, we can create a custom integration.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left">Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes. We use bank-level encryption, comply with SOC 2 standards, and never share your data with third parties. Your
                  business data is completely private and secure.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of business owners who are already saving time, reducing costs, and growing their revenue with Influxity.ai.
            </p>
            <Button size="lg" className="text-lg px-8" onClick={() => (window.location.href = getLoginUrl())}>
              Start Your Free Trial Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ No credit card required • ✓ 14-day free trial • ✓ 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-bold">Influxity.ai</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered automation for restaurants, e-commerce, and service businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Influxity.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
