/**
 * Stripe Product Configuration
 * Define all subscription plans and their pricing here
 */

export const PRODUCTS = {
  STARTER: {
    name: "Starter Plan",
    priceId: process.env.NODE_ENV === "production" 
      ? "price_starter_live" // Replace with actual live price ID after Stripe setup
      : "price_starter_test",
    amount: 9900, // $99.00 in cents
    currency: "usd",
    interval: "month",
    features: [
      "1 location/store",
      "Basic automation",
      "Email support",
      "14-day free trial",
      "Cancel anytime",
    ],
  },
  PROFESSIONAL: {
    name: "Professional Plan",
    priceId: process.env.NODE_ENV === "production"
      ? "price_professional_live" // Replace with actual live price ID after Stripe setup
      : "price_professional_test",
    amount: 29900, // $299.00 in cents
    currency: "usd",
    interval: "month",
    features: [
      "5 locations/stores",
      "All features",
      "Phone support",
      "Dedicated success manager",
      "14-day free trial",
      "30-day money-back guarantee",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise Plan",
    // Enterprise is custom pricing, handled separately
    amount: null,
    currency: "usd",
    features: [
      "Unlimited locations",
      "Custom integrations",
      "24/7 dedicated support",
      "Custom features",
      "SLA guarantee",
      "White-label options",
    ],
  },
} as const;

export type PlanType = keyof typeof PRODUCTS;
