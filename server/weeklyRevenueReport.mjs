/**
 * Weekly Revenue Report — Automated Email to Sean
 * Runs every Sunday at 8PM via cron.
 * Pulls live Stripe data and emails a full revenue summary to seanblack25@gmail.com
 * 
 * Run manually: node server/weeklyRevenueReport.mjs
 */
import Stripe from "stripe";
import nodemailer from "nodemailer";
import "dotenv/config";

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

async function generateReport() {
  console.log("[Weekly Report] Fetching Stripe data...");

  // Active subscriptions
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

  const totalSubscribers = subscribers.starter + subscribers.professional + subscribers.enterprise;

  // Last 7 days of charges
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const recentCharges = await stripe.charges.list({
    created: { gte: sevenDaysAgo },
    limit: 100,
  });

  const weeklyRevenue = recentCharges.data
    .filter(c => c.paid && !c.refunded)
    .reduce((sum, c) => sum + c.amount, 0) / 100;

  const balance = await stripe.balance.retrieve();
  const availableBalance = balance.available.reduce((sum, b) => sum + b.amount, 0) / 100;

  const reportDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const htmlReport = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
  <div style="background: linear-gradient(135deg, #6b21a8, #a855f7); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h1 style="color: #FFD700; margin: 0; font-size: 28px;">INFLUXITY.AI</h1>
    <p style="color: #e9d5ff; margin: 8px 0 0;">Weekly Revenue Report — ${reportDate}</p>
  </div>

  <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #a855f7;">
    <h2 style="color: #6b21a8; margin-top: 0;">💰 Monthly Recurring Revenue</h2>
    <p style="font-size: 48px; font-weight: bold; color: #16a34a; margin: 0;">$${mrr.toLocaleString()}<span style="font-size: 18px; color: #6b7280;">/month</span></p>
    <p style="color: #6b7280; margin: 8px 0 0;">Projected Annual: <strong>$${(mrr * 12).toLocaleString()}</strong></p>
    <div style="background: #f3f4f6; border-radius: 8px; height: 12px; margin-top: 12px;">
      <div style="background: #a855f7; height: 12px; border-radius: 8px; width: ${Math.min((mrr / 10000) * 100, 100)}%;"></div>
    </div>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">${((mrr / 10000) * 100).toFixed(1)}% of $10,000/month goal</p>
  </div>

  <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
    <h2 style="color: #6b21a8; margin-top: 0;">📊 Subscriber Breakdown</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #f9fafb;">
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Plan</th>
        <th style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Subscribers</th>
        <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Revenue</th>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">Starter ($49/mo)</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #f3f4f6;">${subscribers.starter}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f3f4f6;">$${(subscribers.starter * 49).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">Professional ($149/mo)</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #f3f4f6;">${subscribers.professional}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #f3f4f6;">$${(subscribers.professional * 149).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 10px;">Enterprise ($499/mo)</td>
        <td style="padding: 10px; text-align: center;">${subscribers.enterprise}</td>
        <td style="padding: 10px; text-align: right;">$${(subscribers.enterprise * 499).toLocaleString()}</td>
      </tr>
    </table>
    <p style="margin-top: 12px; font-weight: bold; color: #374151;">Total Active Subscribers: ${totalSubscribers}</p>
  </div>

  <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
    <h2 style="color: #6b21a8; margin-top: 0;">📅 This Week</h2>
    <p><strong>Revenue Collected:</strong> $${weeklyRevenue.toLocaleString()}</p>
    <p><strong>Stripe Available Balance:</strong> $${availableBalance.toLocaleString()}</p>
    <p><strong>New Charges:</strong> ${recentCharges.data.filter(c => c.paid).length}</p>
  </div>

  <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #bbf7d0;">
    <h3 style="color: #15803d; margin-top: 0;">✅ Passive Income Streams Active</h3>
    <ul style="color: #374151; margin: 0; padding-left: 20px;">
      <li>SaaS Subscriptions — Processing 24/7</li>
      <li>Affiliate Blog (6 articles) — SEO indexing</li>
      <li>Email Capture Funnel — Collecting leads</li>
      <li>Stripe Webhook — Handling all events</li>
    </ul>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>Influxity.ai Revenue Report · Generated automatically every Sunday at 8PM</p>
    <a href="https://influxity.ai/revenue" style="color: #a855f7;">View Live Dashboard</a>
  </div>
</body>
</html>`;

  return { mrr, totalSubscribers, weeklyRevenue, availableBalance, htmlReport, reportDate };
}

async function sendReport() {
  try {
    const report = await generateReport();

    // Use Gmail SMTP if credentials are set, otherwise log to console
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Influxity.ai Revenue Bot" <${process.env.GMAIL_USER}>`,
        to: "seanblack25@gmail.com",
        subject: `💰 Influxity Weekly Report — $${report.mrr.toLocaleString()} MRR · ${report.reportDate}`,
        html: report.htmlReport,
      });

      console.log(`[Weekly Report] ✅ Report sent to seanblack25@gmail.com — MRR: $${report.mrr}`);
    } else {
      console.log("[Weekly Report] Gmail credentials not set. Report generated:");
      console.log(`  MRR: $${report.mrr} | Subscribers: ${report.totalSubscribers} | Weekly Revenue: $${report.weeklyRevenue}`);
    }
  } catch (error) {
    console.error("[Weekly Report] Error:", error);
  }
}

sendReport();
