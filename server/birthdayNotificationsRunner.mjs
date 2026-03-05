/**
 * Birthday Notification Runner for IMissU.app
 * March 5, 2026
 *
 * Queries the live database, generates compassionate email content,
 * sends via Resend API, and produces a full run report.
 */

import { drizzle } from "drizzle-orm/mysql2";
import { isNotNull, eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import { Resend } from "resend";
import { users, deceasedPersons, birthdayNotificationLogs } from "../drizzle/schema.js";

// ── Configuration ──────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL || "mysql://imissu:imissu_root_2026@127.0.0.1:3306/imissu_app";
const RESEND_API_KEY = process.env.RESEND_API_KEY || null;

// ── Helpers ────────────────────────────────────────────────────────────────────
function isBirthdayToday(dateOfBirth) {
  if (!dateOfBirth) return false;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  return (
    birthDate.getUTCMonth() === today.getUTCMonth() &&
    birthDate.getUTCDate() === today.getUTCDate()
  );
}

function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  return today.getFullYear() - birthDate.getFullYear();
}

function getOrdinalSuffix(num) {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function generateEmailHTML(deceased, user) {
  const age = calculateAge(deceased.dateOfBirth);
  const relationship = deceased.relationship || "loved one";
  const subject = `Remembering ${deceased.name} Today`;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .message { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .resources { background: #fff; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>&#128156; Remembering ${deceased.name}</h1>
    <p style="margin:0;opacity:0.9;">A Birthday Remembrance</p>
  </div>
  <div class="content">
    <div class="message">
      <p>Dear ${user.name || "Friend"},</p>
      <p>Today marks what would have been ${deceased.name}'s ${age}${getOrdinalSuffix(age)} birthday.
      We know this day can bring a mix of emotions — beautiful memories intertwined with the ache of absence.</p>
      <p>Your ${relationship} may no longer be physically present, but the love you shared continues to live on
      in your heart and in the memories you cherish. Today is a day to honor that connection, to remember
      the joy they brought into your life, and to celebrate the time you had together.</p>
      <p><strong>Ways to honor ${deceased.name} today:</strong></p>
      <ul>
        <li>Visit their memorial page and share a favorite memory</li>
        <li>Light a candle in their honor</li>
        <li>Do something they loved or that reminds you of them</li>
        <li>Journal about a special moment you shared</li>
        <li>Connect with others who loved them</li>
      </ul>
    </div>
    ${deceased.memorialPageUrl ? `
    <div style="text-align: center; margin: 20px 0;">
      <a href="${deceased.memorialPageUrl}" class="cta-button">Visit ${deceased.name}'s Memorial Page</a>
    </div>` : ""}
    <div class="resources">
      <h3>&#128153; Grief Support Resources</h3>
      <p>Remember, grief is not linear, and it's okay to feel however you're feeling today.
      If you need support, these resources are here for you:</p>
      <ul>
        <li><strong>Crisis Support:</strong> National Suicide Prevention Lifeline: <strong>988</strong></li>
        <li><strong>Grief Support:</strong> <a href="https://www.griefshare.org">GriefShare.org</a> — Find local support groups</li>
        <li><strong>Online Community:</strong> <a href="https://www.compassionatefriends.org">The Compassionate Friends</a> — bereaved parents and siblings</li>
        <li><strong>Journaling Prompt:</strong> What would you want to tell ${deceased.name} today?</li>
      </ul>
    </div>
    <div class="message">
      <p><em>"What we have once enjoyed deeply we can never lose. All that we love deeply becomes a part of us."</em><br>
      — Helen Keller</p>
    </div>
    <div class="footer">
      <p>You're not alone in your grief. We're here to support you.</p>
      <p style="font-size: 12px; margin-top: 20px; color: #999;">
        You're receiving this because you've chosen to receive birthday reminders for your loved ones.<br>
        You can update your notification preferences in your account settings at
        <a href="https://imissu.app/settings">imissu.app/settings</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
  return { subject, html };
}

// ── Main Run ───────────────────────────────────────────────────────────────────
async function run() {
  const runDate = new Date();
  console.log("=".repeat(70));
  console.log("  IMissU.app Birthday Notification System");
  console.log("=".repeat(70));
  console.log(`  Date: ${runDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`);
  console.log(`  Time: ${runDate.toLocaleTimeString("en-US")}`);
  console.log(`  Resend API: ${RESEND_API_KEY ? "Configured ✅" : "Not configured ⚠️"}`);
  console.log("=".repeat(70));

  // Connect to database
  console.log("\n📡 Connecting to database...");
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);
  console.log("✅ Database connected successfully");

  // Query all deceased persons with birthdays
  const allDeceased = await db
    .select()
    .from(deceasedPersons)
    .where(isNotNull(deceasedPersons.dateOfBirth));

  console.log(`\n📊 Total deceased persons with birthdays on record: ${allDeceased.length}`);

  // Filter to today's birthdays
  const todayBirthdays = allDeceased.filter(p => isBirthdayToday(p.dateOfBirth));
  console.log(`🎂 Birthdays matching today (month/day match, year ignored): ${todayBirthdays.length}`);

  if (todayBirthdays.length === 0) {
    console.log("\nNo birthdays to notify about today.");
    await connection.end();
    return { total: 0, sent: 0, failed: 0, skipped: 0, results: [] };
  }

  const results = [];
  let sentCount = 0, failedCount = 0, skippedCount = 0;

  // Initialize Resend if key is available
  const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
  if (!resend) {
    console.log("\n⚠️  RESEND_API_KEY not set — email content will be generated and logged but not delivered.");
  }

  console.log("\n" + "-".repeat(70));
  console.log("  Processing Notifications");
  console.log("-".repeat(70));

  for (const deceased of todayBirthdays) {
    const age = calculateAge(deceased.dateOfBirth);
    console.log(`\n👤 ${deceased.name} (ID: ${deceased.id})`);
    console.log(`   Relationship: ${deceased.relationship || "loved one"}`);
    console.log(`   Birthday: ${new Date(deceased.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`);
    console.log(`   Would turn ${age}${getOrdinalSuffix(age)} today`);

    // Get associated user
    const userResult = await db.select().from(users).where(eq(users.id, deceased.userId)).limit(1);
    if (userResult.length === 0) {
      console.log(`   ⚠️  User not found for userId ${deceased.userId}`);
      results.push({ deceased: deceased.name, status: "skipped", reason: "User not found" });
      skippedCount++;
      continue;
    }

    const user = userResult[0];
    console.log(`   Associated user: ${user.name} (${user.email})`);
    console.log(`   Email notifications: ${user.notifyEmail ? "ENABLED ✅" : "DISABLED ⛔"}`);

    // Check notification preferences
    if (!user.notifyEmail) {
      console.log(`   ⏭️  Skipped — email notifications disabled by user preference`);
      results.push({ deceased: deceased.name, user: user.name, email: user.email, status: "skipped", reason: "notifyEmail disabled" });
      skippedCount++;
      await db.insert(birthdayNotificationLogs).values({
        deceasedPersonId: deceased.id,
        userId: user.id,
        notificationType: "email",
        status: "failed",
        errorMessage: "User has email notifications disabled",
      });
      continue;
    }

    if (!user.email) {
      console.log(`   ⚠️  Skipped — no email address on file`);
      results.push({ deceased: deceased.name, user: user.name, status: "skipped", reason: "No email address" });
      skippedCount++;
      continue;
    }

    // Generate email content
    const { subject, html } = generateEmailHTML(deceased, user);
    console.log(`   📧 Subject: "${subject}"`);
    console.log(`   📧 Recipient: ${user.email}`);

    if (resend) {
      // Attempt real email delivery
      try {
        const { data, error } = await resend.emails.send({
          from: "IMissU.app <notifications@imissu.app>",
          to: [user.email],
          subject,
          html,
        });
        if (error) throw new Error(JSON.stringify(error));
        console.log(`   ✅ Email sent successfully! Resend ID: ${data.id}`);
        sentCount++;
        results.push({ deceased: deceased.name, user: user.name, email: user.email, status: "sent", resendId: data.id, age });
        await db.insert(birthdayNotificationLogs).values({
          deceasedPersonId: deceased.id,
          userId: user.id,
          notificationType: "email",
          status: "sent",
          errorMessage: null,
        });
      } catch (err) {
        console.error(`   ❌ Failed to send: ${err.message}`);
        failedCount++;
        results.push({ deceased: deceased.name, user: user.name, email: user.email, status: "failed", error: err.message, age });
        await db.insert(birthdayNotificationLogs).values({
          deceasedPersonId: deceased.id,
          userId: user.id,
          notificationType: "email",
          status: "failed",
          errorMessage: err.message,
        });
      }
    } else {
      // No API key — log content but mark as pending
      console.log(`   📋 Email content generated (not sent — RESEND_API_KEY not configured)`);
      results.push({ deceased: deceased.name, user: user.name, email: user.email, status: "pending_api_key", age, subject });
      await db.insert(birthdayNotificationLogs).values({
        deceasedPersonId: deceased.id,
        userId: user.id,
        notificationType: "email",
        status: "failed",
        errorMessage: "RESEND_API_KEY not configured",
      });
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("  Summary");
  console.log("=".repeat(70));
  console.log(`  Total birthdays today:  ${todayBirthdays.length}`);
  console.log(`  Emails sent:            ${sentCount}`);
  console.log(`  Emails failed:          ${failedCount}`);
  console.log(`  Skipped:                ${skippedCount}`);
  console.log("=".repeat(70));

  await connection.end();
  return { total: todayBirthdays.length, sent: sentCount, failed: failedCount, skipped: skippedCount, results };
}

run()
  .then(summary => {
    console.log("\n✅ Birthday notification run completed.");
    process.exitCode = 0;
  })
  .catch(err => {
    console.error("\n❌ Fatal error:", err);
    process.exitCode = 1;
  });
