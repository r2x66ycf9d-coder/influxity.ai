/**
 * Influxity Recover — Audit tRPC Router
 * Exposes the audit generator and $99 Stripe checkout as tRPC mutations
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { runStoreAudit } from "./auditGenerator";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

const RECOVER_PRICE_ID =
  process.env.STRIPE_PRICE_RECOVER || "price_1TEYnR2NSzFeHY2vhc8iReAy";

export const auditRouter = router({
  /**
   * generate — Run a full AI-powered store audit
   * Input: store URL + email
   * Output: AuditResult JSON
   */
  generate: publicProcedure
    .input(
      z.object({
        storeUrl: z.string().min(3, "Please enter a valid store URL"),
        email: z.string().email("Please enter a valid email address"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Log the audit request
        console.log(`[Audit] Running audit for: ${input.storeUrl} | email: ${input.email}`);

        // Persist the lead to file (same as newsletter system)
        try {
          const fs = await import("fs");
          const path = await import("path");
          const dataDir = path.join(process.cwd(), "data");
          if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

          const leadsFile = path.join(dataDir, "audit_leads.json");
          const existing = fs.existsSync(leadsFile)
            ? JSON.parse(fs.readFileSync(leadsFile, "utf-8"))
            : [];

          const isDuplicate = existing.some(
            (l: { email: string; storeUrl: string }) =>
              l.email === input.email && l.storeUrl === input.storeUrl
          );

          if (!isDuplicate) {
            existing.push({
              email: input.email,
              storeUrl: input.storeUrl,
              timestamp: new Date().toISOString(),
              source: "recover-audit-generator",
            });
            fs.writeFileSync(leadsFile, JSON.stringify(existing, null, 2));
          }
        } catch (fsError) {
          console.warn("[Audit] Could not persist lead:", fsError);
        }

        // Run the full audit pipeline
        const audit = await runStoreAudit(input.storeUrl);

        // Notify Sean at sean@influxity.ai if SendGrid is configured
        if (process.env.SENDGRID_API_KEY) {
          try {
            const churnBadge =
              audit.churn_risk === "Critical" || audit.churn_risk === "High"
                ? "🔴"
                : audit.churn_risk === "Medium"
                ? "🟡"
                : "🟢";

            await fetch("https://api.sendgrid.com/v3/mail/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
              },
              body: JSON.stringify({
                personalizations: [{ to: [{ email: "sean@influxity.ai" }] }],
                from: {
                  email: process.env.FROM_EMAIL || "sean@influxity.ai",
                  name: "Influxity Recover",
                },
                subject: `${churnBadge} New Audit: ${input.storeUrl} — ${audit.churn_risk} Churn Risk`,
                content: [
                  {
                    type: "text/html",
                    value: `
                      <div style="font-family: sans-serif; max-width: 600px;">
                        <h2 style="color: #7c3aed;">New Recover Audit Request</h2>
                        <p><strong>Store:</strong> ${input.storeUrl}</p>
                        <p><strong>Email:</strong> ${input.email}</p>
                        <p><strong>Churn Risk:</strong> ${churnBadge} ${audit.churn_risk}</p>
                        <p><strong>Projected Recovery:</strong> ${audit.projected_recovery_value}</p>
                        <p><strong>Summary:</strong> ${audit.summary}</p>
                        <hr/>
                        <p style="color: #6b7280; font-size: 12px;">Influxity Recover Audit System</p>
                      </div>
                    `,
                  },
                ],
              }),
            });
          } catch {
            // Non-blocking — don't fail the audit if email fails
          }
        }

        console.log(
          `[Audit] Complete for ${input.storeUrl} — Risk: ${audit.churn_risk} | Lift: ${audit.revenue_lift}`
        );

        return { success: true, audit };
      } catch (error) {
        console.error("[Audit] Error:", error);
        throw new Error(
          "Audit generation failed. Please try again or contact support."
        );
      }
    }),

  /**
   * createCheckoutSession — Create a Stripe $99 one-time checkout for Recover
   * Input: email + storeUrl
   * Output: Stripe checkout URL to redirect user
   */
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        storeUrl: z.string().min(3),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: input.email,
          line_items: [
            {
              price: RECOVER_PRICE_ID,
              quantity: 1,
            },
          ],
          metadata: {
            storeUrl: input.storeUrl,
            product: "influxity-recover",
          },
          success_url: `${process.env.APP_URL || "https://influxity.ai"}/onboarding?session_id={CHECKOUT_SESSION_ID}&store=${encodeURIComponent(input.storeUrl)}`,
          cancel_url: `${process.env.APP_URL || "https://influxity.ai"}/recover?cancelled=true`,
        });

        // Update lead status to checkout_initiated
        try {
          const fs = await import("fs");
          const path = await import("path");
          const leadsFile = path.join(process.cwd(), "data", "audit_leads.json");
          if (fs.existsSync(leadsFile)) {
            const leads = JSON.parse(fs.readFileSync(leadsFile, "utf-8"));
            const idx = leads.findIndex(
              (l: { email: string; storeUrl: string }) =>
                l.email === input.email && l.storeUrl === input.storeUrl
            );
            if (idx !== -1) {
              leads[idx].status = "checkout_initiated";
              leads[idx].stripeSessionId = session.id;
              fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
            }
          }
        } catch {}

        return { url: session.url };
      } catch (error) {
        console.error("[Recover Checkout] Stripe error:", error);
        throw new Error("Could not create checkout session. Please try again.");
      }
    }),
});
