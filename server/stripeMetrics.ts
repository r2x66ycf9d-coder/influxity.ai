/**
 * Stripe Revenue Metrics
 * Fetches live MRR, subscriber counts, and Stripe balance.
 * Called by the Revenue Dashboard every 60 seconds.
 */
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_1TEPWq2NSzFeHY2voF6hsoOF",
  professional: process.env.STRIPE_PRICE_PROFESSIONAL || "price_1TEPWv2NSzFeHY2vJW8gKgzg",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "price_1TEPX02NSzFeHY2vSaraFf4z",
};

const PLAN_AMOUNTS = {
  [PRICE_IDS.starter]: 49,
  [PRICE_IDS.professional]: 149,
  [PRICE_IDS.enterprise]: 499,
};

export async function getRevenueMetrics() {
  try {
    // Fetch all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.items.data.price"],
    });

    let mrr = 0;
    const subscribers = { starter: 0, professional: 0, enterprise: 0 };

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const priceId = item.price.id;
        const amount = PLAN_AMOUNTS[priceId] || 0;
        mrr += amount;

        if (priceId === PRICE_IDS.starter) subscribers.starter++;
        else if (priceId === PRICE_IDS.professional) subscribers.professional++;
        else if (priceId === PRICE_IDS.enterprise) subscribers.enterprise++;
      }
    }

    // Get Stripe balance
    const balance = await stripe.balance.retrieve();
    const availableBalance = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;

    return {
      mrr,
      subscribers,
      totalSubscribers: subscribers.starter + subscribers.professional + subscribers.enterprise,
      affiliateClicks: 0, // Populated by affiliateRoutes.ts in memory
      emailSubscribers: 0, // Populated by Beehiiv API when key is set
      stripeBalance: availableBalance,
    };
  } catch (error) {
    console.error("[Stripe Metrics] Error fetching metrics:", error);
    return {
      mrr: 0,
      subscribers: { starter: 0, professional: 0, enterprise: 0 },
      totalSubscribers: 0,
      affiliateClicks: 0,
      emailSubscribers: 0,
      stripeBalance: 0,
    };
  }
}
