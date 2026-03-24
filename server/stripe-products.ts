/**
 * Stripe Products and Prices Configuration
 * Live Stripe products created and configured — March 2026
 * Products and prices are live in the Stripe account.
 */

export const STRIPE_PRODUCTS = {
  // Subscription Plans
  STARTER: {
    name: 'Starter Plan',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_1TEPWq2NSzFeHY2voF6hsoOF',
    productId: process.env.STRIPE_PRODUCT_STARTER || 'prod_UCpBK6urfcZxY8',
    amount: 4900, // $49.00
    currency: 'usd',
    interval: 'month',
    features: [
      '1,000 AI interactions/month',
      'Basic chatbot',
      'Content generation',
      'Email support',
      '1 user seat',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional Plan',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_1TEPWv2NSzFeHY2vJW8gKgzg',
    productId: process.env.STRIPE_PRODUCT_PROFESSIONAL || 'prod_UCpBPC1BihiLyt',
    amount: 14900, // $149.00
    currency: 'usd',
    interval: 'month',
    features: [
      '10,000 AI interactions/month',
      'Advanced chatbot with custom training',
      'Full content suite',
      'Smart scheduling',
      'Product recommendations',
      'Lead intelligence',
      'Priority support',
      '5 user seats',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise Plan',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_1TEPX02NSzFeHY2vSaraFf4z',
    productId: process.env.STRIPE_PRODUCT_ENTERPRISE || 'prod_UCpB7Et1tEbKD4',
    amount: 49900, // $499.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited AI interactions',
      'Custom AI model training',
      'White-label solution',
      'API access',
      'Dedicated account manager',
      '24/7 phone support',
      'Unlimited user seats',
      'Custom integrations',
    ],
  },
} as const;

export type PlanType = keyof typeof STRIPE_PRODUCTS;
