/**
 * Influxity Recover — Email Service
 * Automated follow-up sequence using Resend
 * 
 * Sequence:
 * Email 1 (immediate): Audit results summary + $99 CTA
 * Email 2 (24hr):      "Your revenue is still sitting there" nudge + $99 CTA
 * Email 3 (48hr):      Final call + $299 upgrade offer
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Influxity Recover <sean@influxity.ai>";
const RECOVER_URL = "https://influxity.ai/recover";

interface AuditEmailData {
  email: string;
  storeUrl: string;
  churnRisk: string;
  projectedRecovery: string;
  revenueLift: string;
  summary: string;
}

/**
 * Email 1 — Immediate: Audit results + $99 CTA
 */
export async function sendAuditResultsEmail(data: AuditEmailData) {
  const riskEmoji =
    data.churnRisk === "Critical" ? "🔴" :
    data.churnRisk === "High" ? "🟠" :
    data.churnRisk === "Medium" ? "🟡" : "🟢";

  const { error } = await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `${riskEmoji} Your store audit is ready — ${data.projectedRecovery} in recoverable revenue`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:linear-gradient(135deg,#7c3aed,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
        INFLUXITY RECOVER
      </div>
      <div style="color:#6b7280;font-size:13px;margin-top:4px;">Churn Intelligence for Shopify</div>
    </div>

    <!-- Audit Result Card -->
    <div style="background:#111118;border:1px solid #2a2a3a;border-radius:16px;padding:28px;margin-bottom:24px;">
      <div style="font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">
        AUDIT COMPLETE — ${data.storeUrl}
      </div>
      
      <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:140px;background:#1a1a2e;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#d97706;">${data.projectedRecovery}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Recoverable Revenue</div>
        </div>
        <div style="flex:1;min-width:140px;background:#1a1a2e;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#7c3aed;">${riskEmoji} ${data.churnRisk}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Churn Risk Level</div>
        </div>
        <div style="flex:1;min-width:140px;background:#1a1a2e;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#10b981;">${data.revenueLift}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Revenue Lift Potential</div>
        </div>
      </div>

      <div style="background:#0f0f1a;border-left:3px solid #7c3aed;border-radius:0 8px 8px 0;padding:14px 16px;">
        <div style="font-size:13px;color:#d1d5db;line-height:1.6;">${data.summary}</div>
      </div>
    </div>

    <!-- CTA -->
    <div style="background:linear-gradient(135deg,#1a0a2e,#1a1000);border:1px solid #7c3aed40;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
      <div style="font-size:20px;font-weight:800;color:#ffffff;margin-bottom:8px;">
        Ready to recover that revenue?
      </div>
      <div style="font-size:14px;color:#9ca3af;margin-bottom:20px;line-height:1.5;">
        I'll set up your first win-back flow and give you everything ready to deploy within 24 hours.<br>
        <strong style="color:#d97706;">Most stores make it back from one campaign.</strong>
      </div>
      <a href="${RECOVER_URL}?email=${encodeURIComponent(data.email)}&store=${encodeURIComponent(data.storeUrl)}" 
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#d97706);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
        Activate Recovery System — $99 →
      </a>
      <div style="font-size:11px;color:#4b5563;margin-top:12px;">No subscriptions. One-time setup. 24-hour delivery.</div>
    </div>

    <!-- What you get -->
    <div style="background:#111118;border:1px solid #2a2a3a;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-size:13px;font-weight:700;color:#d97706;margin-bottom:12px;">WHAT'S INCLUDED AT $99</div>
      ${["At-risk customer segments identified", "3 personalized win-back email templates", "SMS recovery script", "24-hour execution plan", "Revenue recovery projection"].map(f => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="color:#10b981;font-size:14px;">✓</span>
        <span style="font-size:13px;color:#d1d5db;">${f}</span>
      </div>`).join("")}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;border-top:1px solid #1f1f2e;">
      <div style="font-size:12px;color:#4b5563;">
        Influxity Recover · <a href="https://influxity.ai" style="color:#7c3aed;text-decoration:none;">influxity.ai</a><br>
        Questions? Reply to this email or reach Sean at sean@influxity.ai
      </div>
    </div>

  </div>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send audit results email:", error);
    return false;
  }
  console.log(`[Email] Audit results sent to ${data.email}`);
  return true;
}

/**
 * Email 2 — 24hr nudge: Revenue still sitting there
 */
export async function sendFollowUp24hr(data: { email: string; storeUrl: string; projectedRecovery: string }) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Your ${data.projectedRecovery} is still sitting there — quick check`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <div style="text-align:center;margin-bottom:28px;">
      <div style="background:linear-gradient(135deg,#7c3aed,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;font-weight:900;">
        INFLUXITY RECOVER
      </div>
    </div>

    <div style="background:#111118;border:1px solid #2a2a3a;border-radius:16px;padding:28px;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:12px;">
        Hey — just checking in on ${data.storeUrl}
      </div>
      <div style="font-size:14px;color:#9ca3af;line-height:1.7;margin-bottom:16px;">
        Your audit showed <strong style="color:#d97706;">${data.projectedRecovery} in recoverable revenue</strong> sitting in your customer base right now.
      </div>
      <div style="font-size:14px;color:#9ca3af;line-height:1.7;margin-bottom:16px;">
        Those customers already bought from you. They know your brand. They just need the right message at the right time.
      </div>
      <div style="font-size:14px;color:#9ca3af;line-height:1.7;">
        That's exactly what the $99 activation sets up — your first win-back flow, ready to deploy in 24 hours.
      </div>
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${RECOVER_URL}?email=${encodeURIComponent(data.email)}&store=${encodeURIComponent(data.storeUrl)}"
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#d97706);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
        Activate for $99 — Get It Done Today →
      </a>
    </div>

    <div style="text-align:center;font-size:12px;color:#4b5563;">
      Influxity Recover · <a href="https://influxity.ai" style="color:#7c3aed;text-decoration:none;">influxity.ai</a> · Reply to opt out
    </div>
  </div>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send 24hr follow-up:", error);
    return false;
  }
  console.log(`[Email] 24hr follow-up sent to ${data.email}`);
  return true;
}

/**
 * Email 3 — 48hr final: Upgrade offer + last call
 */
export async function sendFollowUp48hr(data: { email: string; storeUrl: string; projectedRecovery: string }) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Last call — want me to handle the full retention system for ${data.storeUrl}?`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <div style="text-align:center;margin-bottom:28px;">
      <div style="background:linear-gradient(135deg,#7c3aed,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;font-weight:900;">
        INFLUXITY RECOVER
      </div>
    </div>

    <div style="background:#111118;border:1px solid #2a2a3a;border-radius:16px;padding:28px;margin-bottom:24px;">
      <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:12px;">
        Two options for ${data.storeUrl}
      </div>
      
      <!-- Option 1 -->
      <div style="background:#1a1a2e;border:1px solid #7c3aed40;border-radius:12px;padding:16px;margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;color:#d97706;margin-bottom:6px;">OPTION 1 — $99 Quick Win-Back</div>
        <div style="font-size:13px;color:#9ca3af;line-height:1.6;">3 win-back emails + SMS script + execution plan. Ready in 24 hours. Best for getting started fast.</div>
        <a href="${RECOVER_URL}?email=${encodeURIComponent(data.email)}&store=${encodeURIComponent(data.storeUrl)}"
           style="display:inline-block;margin-top:10px;background:#7c3aed;color:#fff;font-size:12px;font-weight:700;padding:8px 16px;border-radius:6px;text-decoration:none;">
          Start with $99 →
        </a>
      </div>

      <!-- Option 2 -->
      <div style="background:#1a1000;border:1px solid #d9770640;border-radius:12px;padding:16px;">
        <div style="font-size:13px;font-weight:700;color:#d97706;margin-bottom:6px;">OPTION 2 — $299 Full Retention System ⭐</div>
        <div style="font-size:13px;color:#9ca3af;line-height:1.6;">Complete lifecycle segmentation, 5-email win-back sequence, post-purchase flow, and 30-day optimization. Everything done for you.</div>
        <a href="${RECOVER_URL}?email=${encodeURIComponent(data.email)}&store=${encodeURIComponent(data.storeUrl)}&plan=full"
           style="display:inline-block;margin-top:10px;background:linear-gradient(135deg,#7c3aed,#d97706);color:#fff;font-size:12px;font-weight:700;padding:8px 16px;border-radius:6px;text-decoration:none;">
          Get the Full System — $299 →
        </a>
      </div>
    </div>

    <div style="text-align:center;font-size:13px;color:#6b7280;margin-bottom:16px;">
      Either way, you're recovering ${data.projectedRecovery} that's already yours.<br>
      Just reply to this email if you want to talk through which option fits your store.
    </div>

    <div style="text-align:center;font-size:12px;color:#4b5563;">
      Influxity Recover · <a href="https://influxity.ai" style="color:#7c3aed;text-decoration:none;">influxity.ai</a> · Reply to opt out
    </div>
  </div>
</body>
</html>
    `,
  });

  if (error) {
    console.error("[Email] Failed to send 48hr follow-up:", error);
    return false;
  }
  console.log(`[Email] 48hr follow-up sent to ${data.email}`);
  return true;
}

/**
 * Notify Sean of new audit lead
 */
export async function notifySeanNewLead(data: { email: string; storeUrl: string; churnRisk: string; projectedRecovery: string }) {
  const riskEmoji = data.churnRisk === "Critical" ? "🔴" : data.churnRisk === "High" ? "🟠" : data.churnRisk === "Medium" ? "🟡" : "🟢";
  
  await resend.emails.send({
    from: FROM,
    to: "sean@influxity.ai",
    subject: `${riskEmoji} NEW LEAD: ${data.storeUrl} — ${data.projectedRecovery} recoverable`,
    html: `
<div style="font-family:sans-serif;max-width:500px;padding:20px;background:#0a0a0f;color:#fff;">
  <h2 style="color:#d97706;">🔥 New Audit Lead</h2>
  <p><strong>Store:</strong> ${data.storeUrl}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Churn Risk:</strong> ${riskEmoji} ${data.churnRisk}</p>
  <p><strong>Recoverable Revenue:</strong> <span style="color:#d97706;font-size:18px;font-weight:bold;">${data.projectedRecovery}</span></p>
  <hr style="border-color:#2a2a3a;"/>
  <p style="color:#9ca3af;font-size:12px;">Follow up within 2 minutes for highest conversion rate.<br>
  DM them: "I looked at your numbers — you've got real churn. Want me to set up your first recovery flow today? That's the $99 activation."</p>
</div>
    `,
  });
}
