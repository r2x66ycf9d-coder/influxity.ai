import Stripe from "stripe";
import { ENV } from "./_core/env";
import { PRODUCTS } from "./products";
import { createSubscription, updateSubscription, getUserSubscription } from "./db";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(params: {
  userId: number;
  userEmail: string;
  userName: string;
  plan: "STARTER" | "PROFESSIONAL";
  origin: string;
}) {
  const { userId, userEmail, userName, plan, origin } = params;

  const product = PRODUCTS[plan];
  if (!product.priceId) {
    throw new Error(`Price ID not configured for ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: product.priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
      plan: plan.toLowerCase(),
    },
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?payment=success`,
    cancel_url: `${origin}/?payment=cancelled`,
    subscription_data: {
      metadata: {
        user_id: userId.toString(),
        plan: plan.toLowerCase(),
      },
      trial_period_days: 14,
    },
  });

  return session;
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  console.log(`[Webhook] Processing event: ${event.type} (${event.id})`);

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return { verified: true };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[Webhook] Invoice paid: ${invoice.id} for customer ${invoice.customer}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[Webhook] Payment failed: ${invoice.id} for customer ${invoice.customer}`);
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.user_id || session.client_reference_id || "0");
  if (!userId) {
    console.error("[Webhook] No user ID found in checkout session");
    return;
  }

  console.log(`[Webhook] Checkout completed for user ${userId}`);

  // Get subscription details
  if (session.subscription && typeof session.subscription === "string") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await handleSubscriptionUpdate(subscription);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = parseInt(subscription.metadata?.user_id || "0");
  if (!userId) {
    console.error("[Webhook] No user ID found in subscription metadata");
    return;
  }

  const plan = subscription.metadata?.plan || "starter";
  const status = subscription.status;

  console.log(`[Webhook] Subscription ${subscription.id} for user ${userId}: ${status}`);

  // Map Stripe status to our status
  let dbStatus: "active" | "canceled" | "past_due" | "trialing" = "active";
  if (status === "trialing") dbStatus = "trialing";
  else if (status === "past_due") dbStatus = "past_due";
  else if (status === "canceled" || status === "unpaid") dbStatus = "canceled";

  // Check if subscription exists
  const existing = await getUserSubscription(userId);

  if (existing) {
    // Update existing subscription
    await updateSubscription(existing.id, {
      status: dbStatus,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      currentPeriodStart: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000) : undefined,
      currentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : undefined,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    });
  } else {
    // Create new subscription
    await createSubscription({
      userId,
      plan: plan as "starter" | "professional" | "enterprise",
      status: dbStatus,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000) : undefined,
      currentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : undefined,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = parseInt(subscription.metadata?.user_id || "0");
  if (!userId) {
    console.error("[Webhook] No user ID found in subscription metadata");
    return;
  }

  console.log(`[Webhook] Subscription deleted for user ${userId}`);

  const existing = await getUserSubscription(userId);
  if (existing) {
    await updateSubscription(existing.id, {
      status: "canceled",
    });
  }
}
