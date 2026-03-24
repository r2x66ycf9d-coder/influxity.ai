/**
 * Stripe Product Configuration
 * Live Price IDs activated — March 2026
 * Products created via Stripe API and wired to live payment processing
 */

export const PRODUCTS = {
  STARTER: {
    name: "Starter Plan",
    priceId: process.env.STRIPE_PRICE_STARTER || "price_1TEPWq2NSzFeHY2voF6hsoOF",
    amount: 4900, // $49.00 in cents
    currency: "usd",
    interval: "month",
    features: [
      "AI Chatbot (GPT-4 powered)",
      "Content Generator",
      "Lead Intelligence & Scoring",
      "Email support",
      "14-day free trial",
      "Cancel anytime",
    ],
  },
  PROFESSIONAL: {
    name: "Professional Plan",
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || "price_1TEPWv2NSzFeHY2vJW8gKgzg",
    amount: 14900, // $149.00 in cents
    currency: "usd",
    interval: "month",
    features: [
      "Everything in Starter",
      "Voice AI (Whisper transcription)",
      "Smart Scheduler",
      "AI Product Recommendations",
      "Priority phone support",
      "Dedicated success manager",
      "14-day free trial",
      "30-day money-back guarantee",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise Plan",
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || "price_1TEPX02NSzFeHY2vSaraFf4z",
    amount: 49900, // $499.00 in cents
    currency: "usd",
    interval: "month",
    features: [
      "Everything in Professional",
      "Unlimited AI usage",
      "Custom integrations",
      "White-label options",
      "24/7 dedicated support",
      "SLA guarantee",
      "Custom feature development",
    ],
  },
} as const;

export type PlanType = keyof typeof PRODUCTS;
