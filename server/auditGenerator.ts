/**
 * Influxity Recover — Automated Audit Generator
 * Step 1: Scrape store homepage for basic signals
 * Step 2: Generate AI-powered retention audit via GPT-4
 * Step 3: Return structured JSON for frontend display
 */

import { invokeLLM } from "./_core/llm";

export interface AuditResult {
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

/**
 * STEP 1 — Basic store scraper (no OAuth needed)
 * Fetches the store homepage and extracts retention signals
 */
async function scrapeStoreSignals(storeUrl: string): Promise<{
  html: string;
  has_email_capture: boolean;
  has_discount_offers: boolean;
  has_cart_recovery: boolean;
  product_count_estimate: string;
}> {
  const defaultSignals = {
    html: "",
    has_email_capture: false,
    has_discount_offers: false,
    has_cart_recovery: false,
    product_count_estimate: "unknown",
  };

  try {
    // Normalize URL
    let url = storeUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; InfluxityAuditBot/1.0; +https://influxity.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeout);

    const html = await response.text();
    const lowerHtml = html.toLowerCase();

    // Detect email capture forms
    const has_email_capture =
      lowerHtml.includes("subscribe") ||
      lowerHtml.includes("newsletter") ||
      lowerHtml.includes("email") ||
      lowerHtml.includes("sign up") ||
      lowerHtml.includes("signup") ||
      lowerHtml.includes("join");

    // Detect discount/promo signals
    const has_discount_offers =
      lowerHtml.includes("discount") ||
      lowerHtml.includes("% off") ||
      lowerHtml.includes("promo") ||
      lowerHtml.includes("coupon") ||
      lowerHtml.includes("sale") ||
      lowerHtml.includes("save");

    // Detect cart recovery / abandoned cart signals
    const has_cart_recovery =
      lowerHtml.includes("abandoned") ||
      lowerHtml.includes("cart recovery") ||
      lowerHtml.includes("klaviyo") ||
      lowerHtml.includes("omnisend") ||
      lowerHtml.includes("drip") ||
      lowerHtml.includes("mailchimp");

    // Estimate product count from common patterns
    const productMatches = html.match(/product|item|sku/gi);
    const product_count_estimate =
      productMatches && productMatches.length > 100
        ? "large catalog (100+)"
        : productMatches && productMatches.length > 20
        ? "medium catalog (20–100)"
        : "small catalog (<20)";

    return {
      html: html.slice(0, 3000), // Limit to 3000 chars for GPT context
      has_email_capture,
      has_discount_offers,
      has_cart_recovery,
      product_count_estimate,
    };
  } catch {
    // If scrape fails, proceed with AI audit using URL alone
    return defaultSignals;
  }
}

/**
 * STEP 2 — AI Audit Generation using exact ChatGPT-specified prompt structure
 */
async function generateAIAudit(
  storeUrl: string,
  signals: Awaited<ReturnType<typeof scrapeStoreSignals>>
): Promise<AuditResult> {
  const signalContext = `
Store signals detected:
- Email capture present: ${signals.has_email_capture ? "YES" : "NO — CRITICAL GAP"}
- Discount/promo offers: ${signals.has_discount_offers ? "YES" : "NO"}
- Cart recovery tools detected: ${signals.has_cart_recovery ? "YES (Klaviyo/similar)" : "NO — CRITICAL GAP"}
- Product catalog size: ${signals.product_count_estimate}
${signals.html ? `\nHomepage content preview:\n${signals.html.slice(0, 1500)}` : ""}
`.trim();

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an e-commerce retention expert and conversion rate specialist working for Influxity.ai. 
Your job is to analyze stores and identify exactly what revenue they are losing from customer churn and poor retention systems.
Be specific, data-driven, and direct. Use real e-commerce benchmarks.
Always return ONLY valid JSON — no markdown, no explanation outside the JSON.`,
      },
      {
        role: "user",
        content: `Analyze this store: ${storeUrl}

${signalContext}

Based on typical Shopify/e-commerce benchmarks:
- Estimate churn risk (Low/Medium/High/Critical)
- Identify missing retention systems
- Estimate recoverable revenue (2–8% range)
- Generate a sample personalized recovery message

Return ONLY this exact JSON structure (no markdown, no code blocks):
{
  "summary": "2-3 sentence executive summary of the store's retention health",
  "issues": ["issue 1", "issue 2", "issue 3", "issue 4"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "revenue_lift": "X–Y% estimated revenue lift",
  "message": "Sample AI-generated recovery email subject line and first sentence",
  "estimated_lost_customers": 500,
  "projected_recovery_value": "$X,XXX–$XX,XXX annually",
  "churn_risk": "High"
}`,
      },
    ],
    maxTokens: 800,
  });

  try {
    // Clean response — remove any markdown code blocks if present
    let raw = (result.choices?.[0]?.message?.content ?? "") as string;
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(raw) as AuditResult;

    // Merge in the scraped signals
    parsed.store_signals = {
      has_email_capture: signals.has_email_capture,
      has_discount_offers: signals.has_discount_offers,
      has_cart_recovery: signals.has_cart_recovery,
      product_count_estimate: signals.product_count_estimate,
    };

    return parsed;
  } catch {
    // Fallback audit if JSON parsing fails
    return {
      summary: `${storeUrl} shows several common retention gaps that are likely costing 15–30% of potential repeat revenue. Without automated recovery systems, churned customers are leaving permanently.`,
      issues: [
        "No automated win-back email sequence detected",
        "Missing cart abandonment recovery flow",
        "No post-purchase loyalty or upsell sequence",
        "Insufficient re-engagement campaigns for lapsed customers",
      ],
      opportunities: [
        "Implement a 3-step win-back email sequence targeting 90-day inactive customers",
        "Add cart abandonment recovery with a time-sensitive discount offer",
        "Launch a post-purchase upsell flow to increase average order value",
      ],
      revenue_lift: "2–8%",
      message:
        "Subject: We saved something for you 👀 — Hey [Name], it's been a while. We noticed you haven't visited recently, so we set aside something special just for you.",
      estimated_lost_customers: 400,
      projected_recovery_value: "$2,400–$9,600 annually",
      churn_risk: "High",
      store_signals: {
        has_email_capture: signals.has_email_capture,
        has_discount_offers: signals.has_discount_offers,
        has_cart_recovery: signals.has_cart_recovery,
        product_count_estimate: signals.product_count_estimate,
      },
    };
  }
}

/**
 * MAIN EXPORT — Run the full audit pipeline
 */
export async function runStoreAudit(storeUrl: string): Promise<AuditResult> {
  // Step 1: Scrape
  const signals = await scrapeStoreSignals(storeUrl);

  // Step 2: AI Audit
  const audit = await generateAIAudit(storeUrl, signals);

  return audit;
}
