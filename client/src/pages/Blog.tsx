import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, User, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content: string;
  affiliateLinks?: { label: string; url: string; description: string }[];
}

const blogPosts: BlogPost[] = [
  {
    id: "ai-tools-save-money",
    title: "7 AI Tools That Save Small Businesses $24,000 Per Year",
    excerpt:
      "Discover the exact AI stack that restaurants, e-commerce stores, and service businesses are using to cut costs and boost revenue on autopilot.",
    category: "AI Tools",
    readTime: "6 min read",
    date: "March 2026",
    content: `Running a small business in 2026 means competing against companies with 10x your headcount. The secret weapon? AI automation. Here are the 7 tools making the biggest impact.

**1. AI Chatbot for Customer Service**
Instead of paying a full-time support rep $45,000/year, businesses are deploying GPT-4 powered chatbots that handle 80% of inquiries instantly, 24/7. Influxity.ai's built-in chatbot alone saves the average client $18,000/year.

**2. AI Content Generator**
Stop paying $500/month for copywriters. AI content tools generate blog posts, product descriptions, and email campaigns in seconds. Tools like Jasper AI and Influxity.ai's Content Generator produce conversion-optimized copy at a fraction of the cost.

**3. Lead Intelligence & Scoring**
AI can analyze your CRM data and score leads automatically, so your sales team only calls the hottest prospects. This alone increases close rates by 30%.

**4. Voice AI for Transcription**
Every sales call, meeting, and customer interaction can be automatically transcribed and summarized. No more manual note-taking.

**5. Smart Scheduling**
AI scheduling tools eliminate the back-and-forth of booking meetings and optimize staff schedules to reduce overtime costs.

**6. AI-Powered Email Campaigns**
Personalized email sequences that adapt based on user behavior drive 3x higher open rates than generic blasts.

**7. Predictive Analytics**
Know what your customers will buy before they do. AI demand forecasting reduces inventory waste by up to 30%.`,
    affiliateLinks: [
      {
        label: "Try Jasper AI",
        url: "https://www.jasper.ai/?fpr=influxity",
        description: "AI content generation — 20% recurring commission",
      },
      {
        label: "Try Influxity.ai Free",
        url: "/pricing",
        description: "All 7 tools in one platform — 14-day free trial",
      },
    ],
  },
  {
    id: "passive-income-ai",
    title: "How to Build a $10,000/Month Passive Income Stream Using AI in 2026",
    excerpt:
      "The step-by-step blueprint for building automated revenue streams using LLMs, AI agents, and the right SaaS tools — without writing a single line of code.",
    category: "Passive Income",
    readTime: "8 min read",
    date: "March 2026",
    content: `The dream of making money while you sleep is no longer a fantasy. AI has made it accessible to anyone willing to set up the right systems. Here is the exact blueprint.

**Step 1: Choose Your Niche**
The most profitable AI-powered passive income niches in 2026 are: bookkeeping automation, e-commerce optimization, content creation, and lead generation. Pick one you understand.

**Step 2: Build Your AI-Powered Platform**
You don't need to code. Platforms like Influxity.ai give you a white-label AI suite you can deploy for clients. Charge $149-$499/month per client and let the AI do the work.

**Step 3: Automate Lead Generation**
Use SEO-optimized blog content (like this article) to attract organic traffic. Capture emails with a lead magnet. Nurture with an automated email sequence. Convert to paid subscribers.

**Step 4: Set Up Recurring Revenue**
The key to passive income is recurring billing. Monthly subscriptions mean you get paid every month without re-selling. 10 clients at $149/month = $1,490 MRR. 100 clients = $14,900 MRR.

**Step 5: Stack Affiliate Income**
Recommend the tools you use and earn 20-30% recurring commissions. HubSpot pays $250-$1,000 per referral. ElevenLabs pays 22% recurring. Stack 5-10 affiliate relationships and you have a second income stream.`,
    affiliateLinks: [
      {
        label: "HubSpot CRM (Free)",
        url: "https://hubspot.com/?utm_source=influxity",
        description: "Best CRM for AI-powered sales — up to $1,000 per referral",
      },
      {
        label: "ElevenLabs Voice AI",
        url: "https://elevenlabs.io/?from=influxity",
        description: "Best AI voice generation — 22% recurring commission",
      },
    ],
  },
  {
    id: "chatgpt-business-prompts",
    title: "50 ChatGPT Prompts That Run Your Business on Autopilot",
    excerpt:
      "Copy-paste these battle-tested prompts to automate your customer service, content creation, sales outreach, and financial reporting.",
    category: "Prompt Engineering",
    readTime: "10 min read",
    date: "March 2026",
    content: `The difference between a business owner who works 80 hours a week and one who works 20 is not talent — it's the quality of their AI prompts. Here are 50 prompts that will transform your operations.

**Customer Service Prompts**
1. "You are a friendly customer service agent for [Business Name]. Answer this customer inquiry professionally and empathetically: [inquiry]"
2. "Generate 5 responses to this negative review that are professional, empathetic, and offer a resolution: [review]"

**Content Creation Prompts**
3. "Write a 500-word SEO blog post about [topic] targeting the keyword [keyword]. Include a compelling headline, 3 subheadings, and a call-to-action."
4. "Generate a 7-day social media content calendar for [business type] with post copy for LinkedIn, Twitter, and Instagram."

**Sales & Lead Generation Prompts**
5. "Write a cold email sequence (5 emails) for [product/service] targeting [audience]. Focus on pain points and ROI."
6. "Analyze this prospect's LinkedIn profile and write a personalized outreach message: [profile text]"

**Financial & Operations Prompts**
7. "Analyze this month's revenue data and identify the top 3 growth opportunities: [data]"
8. "Create a weekly operations report template for a [business type] with KPIs, action items, and team updates."

These prompts are the foundation of the Influxity.ai platform — where they're pre-built into an easy-to-use dashboard.`,
    affiliateLinks: [
      {
        label: "Get All 50 Prompts + Influxity Dashboard",
        url: "/pricing",
        description: "Start your 14-day free trial — no credit card required",
      },
    ],
  },
  {
    id: "ai-bookkeeping-automation",
    title: "AI Bookkeeping: How Sean Blackwell Saves Clients 20 Hours/Week",
    excerpt:
      "The Influxity.ai founder explains how AI-powered bookkeeping automation is transforming small business finances — and how you can implement it today.",
    category: "Bookkeeping",
    readTime: "5 min read",
    date: "March 2026",
    content: `As a QuickBooks ProAdvisor, I have seen firsthand how manual bookkeeping drains small business owners of their most valuable resource: time. The average business owner spends 20+ hours per month on bookkeeping tasks that AI can now handle in minutes.

**What AI Bookkeeping Automation Looks Like**
- Automatic transaction categorization with 98% accuracy
- Real-time P&L reports generated on demand
- Automated invoice creation and payment reminders
- Tax preparation data organized automatically
- Cash flow forecasting based on historical patterns

**The ROI Is Undeniable**
At $150/hour for a bookkeeper, 20 hours/month = $3,000/month in labor costs. Influxity.ai's AI bookkeeping tools handle the same work for $149/month. That's a $2,851/month savings — or $34,212/year.

**How to Get Started**
Connect your QuickBooks or bank account to Influxity.ai. The AI immediately begins categorizing transactions, generating reports, and flagging anomalies. Setup takes less than 30 minutes.`,
    affiliateLinks: [
      {
        label: "QuickBooks Online (30-day free trial)",
        url: "https://quickbooks.intuit.com/partners/influxity",
        description: "Best accounting software — $150+ per referral",
      },
      {
        label: "Start AI Bookkeeping with Influxity",
        url: "/pricing",
        description: "14-day free trial — no credit card required",
      },
    ],
  },
  {
    id: "email-marketing-ai",
    title: "AI Email Marketing: How to Get 45% Open Rates in 2026",
    excerpt:
      "The average email open rate is 21%. Here's how AI-personalized email campaigns are achieving 45%+ open rates and 3x higher conversions.",
    category: "Email Marketing",
    readTime: "7 min read",
    date: "March 2026",
    content: `Email marketing still delivers the highest ROI of any digital channel — $42 for every $1 spent. But only if you're doing it right. AI has completely changed what "doing it right" means.

**Why Generic Emails Fail**
The average person receives 121 emails per day. Generic, batch-and-blast emails get ignored. The businesses winning in 2026 are sending hyper-personalized emails that feel like they were written specifically for each recipient.

**How AI Personalization Works**
AI analyzes each subscriber's behavior — what they clicked, what they bought, when they're most active — and generates email content tailored to their specific interests and stage in the buyer journey.

**The Results Speak for Themselves**
- Open rates: 21% (generic) vs 45% (AI-personalized)
- Click-through rates: 2.5% (generic) vs 8.3% (AI-personalized)
- Revenue per email: $0.08 (generic) vs $0.31 (AI-personalized)

**Tools to Implement AI Email Marketing**
Influxity.ai's Email Generator creates personalized email sequences automatically. Combined with a platform like Beehiiv for delivery, you have a complete AI email marketing stack.`,
    affiliateLinks: [
      {
        label: "Beehiiv Newsletter Platform",
        url: "https://www.beehiiv.com/?via=influxity",
        description: "Best newsletter platform for AI content — 50% first payment commission",
      },
      {
        label: "Generate AI Emails with Influxity",
        url: "/pricing",
        description: "Start free — no credit card required",
      },
    ],
  },
  {
    id: "lead-generation-ai",
    title: "AI Lead Generation: Get 10x More Qualified Leads Without Cold Calling",
    excerpt:
      "How AI-powered lead scoring, content marketing, and automated nurture sequences are replacing cold calling as the #1 lead generation strategy.",
    category: "Lead Generation",
    readTime: "6 min read",
    date: "March 2026",
    content: `Cold calling has a 2% success rate. AI-powered inbound lead generation has a 14.6% close rate. The math is simple — but the implementation requires the right tools and strategy.

**The AI Lead Generation Stack**
1. SEO-optimized content attracts organic traffic (this blog is an example)
2. Lead magnet captures email addresses (free trial, checklist, or tool)
3. AI scores each lead based on behavior and firmographics
4. Automated email sequence nurtures leads over 7-14 days
5. AI chatbot qualifies and books demos automatically

**Lead Scoring with AI**
Not all leads are equal. AI analyzes dozens of signals — pages visited, time on site, email engagement, company size, industry — and assigns each lead a score from 1-100. Your sales team only contacts leads scoring 70+.

**The Result**
One Influxity.ai client reduced their sales team from 5 reps to 2 while increasing revenue by 40% — because the AI was filtering out unqualified leads and only passing through the hottest prospects.`,
    affiliateLinks: [
      {
        label: "HubSpot Sales Hub",
        url: "https://hubspot.com/sales/?utm_source=influxity",
        description: "Best AI-powered CRM — up to $1,000 per referral",
      },
      {
        label: "Try Influxity Lead Intelligence",
        url: "/pricing",
        description: "AI lead scoring included in all plans — 14-day free trial",
      },
    ],
  },
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const newsletterSubscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubscribed(true);
      setEmail("");
      toast.success("Welcome! Your free AI Business Toolkit is on its way.");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    newsletterSubscribe.mutate({ email, source: "blog" });
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          <Button variant="ghost" onClick={() => setSelectedPost(null)} className="mb-8">
            ← Back to Blog
          </Button>
          <Badge className="mb-4">{selectedPost.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{selectedPost.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> Sean Blackwell
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {selectedPost.readTime}
            </span>
            <span>{selectedPost.date}</span>
          </div>
          <div className="prose prose-invert max-w-none mb-12">
            {selectedPost.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return (
                  <h3 key={i} className="text-xl font-bold mt-8 mb-3">
                    {paragraph.replace(/\*\*/g, "")}
                  </h3>
                );
              }
              if (paragraph.includes("**")) {
                return (
                  <p
                    key={i}
                    className="mb-4 text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                );
              }
              return (
                <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {selectedPost.affiliateLinks && selectedPost.affiliateLinks.length > 0 && (
            <div className="border border-border rounded-lg p-6 mb-12">
              <h3 className="font-bold text-lg mb-4">Recommended Tools & Resources</h3>
              <div className="space-y-3">
                {selectedPost.affiliateLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : "_self"}
                    rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center justify-between p-3 rounded-md border border-border hover:border-primary transition-colors group"
                  >
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">{link.label}</div>
                      <div className="text-sm text-muted-foreground">{link.description}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter CTA at bottom of article */}
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Get the Free AI Business Toolkit</h3>
            <p className="text-muted-foreground mb-6">
              Join 2,400+ business owners getting weekly AI automation tips, prompt templates, and revenue strategies.
            </p>
            {subscribed ? (
              <p className="text-primary font-medium">✓ You're subscribed! Check your inbox.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={newsletterSubscribe.isPending}>
                  {newsletterSubscribe.isPending ? "..." : "Subscribe"}
                  {!newsletterSubscribe.isPending && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4">AI Business Intelligence Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Grow Your Business with AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Practical guides, strategies, and tools to automate your business and build passive income with AI.
          </p>
        </div>

        {/* Newsletter Capture Banner */}
        <div className="bg-card border border-border rounded-xl p-8 mb-16 text-center">
          <h2 className="text-2xl font-bold mb-2">Get the Free AI Business Toolkit</h2>
          <p className="text-muted-foreground mb-6">
            50 AI prompts + automation templates + weekly strategies. Join 2,400+ business owners.
          </p>
          {subscribed ? (
            <p className="text-primary font-semibold text-lg">✓ You're in! Check your inbox.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={newsletterSubscribe.isPending}>
                {newsletterSubscribe.isPending ? "Subscribing..." : "Get Free Toolkit"}
                {!newsletterSubscribe.isPending && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(post => (
            <Card
              key={post.id}
              className="p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedPost(post)}
            >
              <Badge variant="secondary" className="mb-3 text-xs">
                {post.category}
              </Badge>
              <h2 className="text-lg font-bold mb-3 leading-snug hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
                <span>{post.date}</span>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Read Article <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
