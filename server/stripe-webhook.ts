import type { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Webhook] Missing stripe-signature header');
    return res.status(400).send('Missing signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // CRITICAL: Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected, returning verification response');
    return res.json({ 
      verified: true,
    });
  }

  console.log(`[Webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('[Webhook] Checkout completed:', {
          sessionId: session.id,
          customerId: session.customer,
          clientReferenceId: session.client_reference_id,
          metadata: session.metadata,
        });

        // TODO: Update user subscription status in database
        // const userId = session.client_reference_id || session.metadata?.user_id;
        // await updateUserSubscription(userId, session.subscription);
        
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[Webhook] Subscription updated:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });

        // TODO: Update subscription status in database
        // await updateSubscriptionStatus(subscription.id, subscription.status);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('[Webhook] Subscription cancelled:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // TODO: Handle subscription cancellation
        // await cancelUserSubscription(subscription.id);
        
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Webhook] Invoice paid:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
        });

        // TODO: Record successful payment
        // await recordPayment(invoice.id, invoice.amount_paid);
        
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Webhook] Payment failed:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        });

        // TODO: Handle failed payment (notify user, suspend service, etc.)
        // await handlePaymentFailure(invoice.customer);
        
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
