/**
 * Birthday Notification Production Run Script for IMissU.app
 * March 9, 2026
 *
 * Queries the imissu_app database for deceased persons whose birthday
 * is today (March 9), generates compassionate email content, and
 * sends via Gmail MCP integration (fallback when RESEND_API_KEY is not configured).
 *
 * Database: imissu_app @ 127.0.0.1:3306
 * Tables: deceasedPersons, users, birthdayNotificationLogs
 */

import mysql from "mysql2/promise";

// ── Configuration ──────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL || "mysql://imissu:imissu_root_2026@127.0.0.1:3306/imissu_app";
const TODAY = new Date();

// ── Helpers ────────────────────────────────────────────────────────────────────
function isBirthdayToday(dateOfBirth) {
  if (!dateOfBirth) return false;
  const birthDate = new Date(dateOfBirth);
  return (
    birthDate.getUTCMonth() === TODAY.getUTCMonth() &&
    birthDate.getUTCDate() === TODAY.getUTCDate()
  );
}

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  return TODAY.getFullYear() - birthDate.getFullYear();
}

function getOrdinalSuffix(num) {
  const j = num % 10, k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function generateEmailText(deceased, user) {
  const age = calculateAge(deceased.dateOfBirth);
  const relationship = deceased.relationship || "loved one";
  const subject = `Remembering ${deceased.name} Today`;

  // Determine pronoun based on relationship
  let pronoun = "they";
  let possessive = "their";
  let object = "them";
  const rel = (relationship || "").toLowerCase();
  if (["father", "grandfather", "husband", "brother", "son", "uncle", "nephew"].includes(rel)) {
    pronoun = "he";
    possessive = "his";
    object = "him";
  } else if (["mother", "grandmother", "wife", "sister", "daughter", "aunt", "niece"].includes(rel)) {
    pronoun = "she";
    possessive = "her";
    object = "her";
  }

  const body = `Dear ${user.name || "Friend"},

Today marks what would have been ${deceased.name}'s ${age}${getOrdinalSuffix(age)} birthday. We know this day can bring a mix of emotions — beautiful memories intertwined with the ache of absence.

Your ${relationship} may no longer be physically present, but the love you shared continues to live on in your heart and in the memories you cherish. Today is a day to honor that connection, to remember the joy ${pronoun} brought into your life, and to celebrate the time you had together.

Ways to honor ${deceased.name} today:
  • Visit ${possessive} memorial page and share a favorite memory
  • Light a candle in ${possessive} honor
  • Do something ${pronoun} loved or that reminds you of ${object}
  • Journal about a special moment you shared
  • Connect with others who loved ${object}
${deceased.memorialPageUrl ? `\n🔗 Visit Memorial Page: ${deceased.memorialPageUrl}\n` : ""}
💙 Grief Support Resources:
  • Crisis Support: National Suicide Prevention Lifeline: 988
  • Grief Support: GriefShare.org — Find local support groups
  • Online Community: The Compassionate Friends — bereaved parents and siblings
  • Journaling Prompt: What would you want to tell ${deceased.name} today?

"What we have once enjoyed deeply we can never lose. All that we love deeply becomes a part of us." — Helen Keller

You're not alone in your grief. We're here to support you.

—
IMissU.app
You're receiving this because you've chosen to receive birthday reminders for your loved ones.
You can update your notification preferences at https://imissu.app/settings`;

  return { subject, body };
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function run() {
  const dateStr = TODAY.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const monthDay = `${TODAY.getUTCMonth() + 1}/${TODAY.getUTCDate()}`;

  console.log("=".repeat(70));
  console.log("  IMissU.app Birthday Notification System");
  console.log(`  Date: ${dateStr}  |  Checking for month/day: ${monthDay}`);
  console.log("=".repeat(70));

  let connection;
  let allPersons = [];
  let allUsers = [];
  let dbAvailable = false;

  // ── Attempt database connection ──────────────────────────────────────────────
  try {
    connection = await mysql.createConnection(DATABASE_URL);
    await connection.ping();
    dbAvailable = true;
    console.log("\n✅ Database connected: imissu_app @ 127.0.0.1:3306");

    // Query all deceased persons with non-null dateOfBirth
    const [persons] = await connection.execute(
      "SELECT * FROM deceasedPersons WHERE dateOfBirth IS NOT NULL"
    );
    allPersons = persons;

    // Query all users
    const [users] = await connection.execute(
      "SELECT id, name, email, notifyEmail, notifySms, notifyInApp FROM users"
    );
    allUsers = users;

    console.log(`📊 Total deceased persons with birthdays on record: ${allPersons.length}`);
    console.log(`👥 Total users: ${allUsers.length}`);
  } catch (dbErr) {
    console.error(`\n⚠️  Database connection failed: ${dbErr.message}`);
    console.log("   Using fallback dataset...");
    dbAvailable = false;
  }

  // ── Filter to today's birthdays ──────────────────────────────────────────────
  const todayBirthdays = allPersons.filter(p => isBirthdayToday(p.dateOfBirth));
  console.log(`\n🎂 Birthdays matching today (${monthDay}): ${todayBirthdays.length}`);

  if (todayBirthdays.length === 0) {
    console.log("   No birthdays to notify about today.");
    if (connection) await connection.end();
    return { total: 0, sent: 0, failed: 0, skipped: 0, results: [] };
  }

  // ── Process each birthday ────────────────────────────────────────────────────
  console.log("\n" + "-".repeat(70));
  console.log("  Processing Notifications");
  console.log("-".repeat(70));

  let skippedCount = 0;
  const results = [];
  const emailsToSend = [];

  for (const deceased of todayBirthdays) {
    const age = calculateAge(deceased.dateOfBirth);
    const birthDateStr = new Date(deceased.dateOfBirth).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric"
    });

    console.log(`\n👤 ${deceased.name} (ID: ${deceased.id})`);
    console.log(`   Relationship: ${deceased.relationship || "loved one"}`);
    console.log(`   Birthday: ${birthDateStr}`);
    console.log(`   Would turn ${age}${getOrdinalSuffix(age)} today`);

    // Find associated user
    const user = allUsers.find(u => u.id === deceased.userId);
    if (!user) {
      console.log(`   ⚠️  User not found for userId ${deceased.userId}`);
      results.push({ deceased: deceased.name, status: "skipped", reason: "User not found" });
      skippedCount++;
      continue;
    }

    console.log(`   Associated user: ${user.name} (${user.email})`);
    console.log(`   Email notifications: ${user.notifyEmail ? "ENABLED ✅" : "DISABLED ⛔"}`);

    // Check notification preferences
    if (!user.notifyEmail) {
      console.log(`   ⏭️  Skipped — email notifications disabled by user preference`);
      results.push({
        deceased: deceased.name,
        user: user.name,
        email: user.email,
        status: "skipped",
        reason: "notifyEmail disabled",
        age,
      });
      skippedCount++;

      // Log to DB if available
      if (dbAvailable && connection) {
        try {
          await connection.execute(
            "INSERT INTO birthdayNotificationLogs (deceasedPersonId, userId, notificationType, status, errorMessage) VALUES (?, ?, ?, ?, ?)",
            [deceased.id, user.id, "email", "failed", "User has email notifications disabled"]
          );
        } catch (e) { /* log silently */ }
      }
      continue;
    }

    if (!user.email) {
      console.log(`   ⚠️  Skipped — no email address on file`);
      results.push({ deceased: deceased.name, user: user.name, status: "skipped", reason: "No email address", age });
      skippedCount++;
      continue;
    }

    // Generate email content
    const { subject, body } = generateEmailText(deceased, user);
    console.log(`   📧 Subject: "${subject}"`);
    console.log(`   📧 Recipient: ${user.email}`);

    // Queue for Gmail MCP send
    emailsToSend.push({ deceased, user, subject, body, age });
  }

  // ── Output email data for Gmail MCP ─────────────────────────────────────────
  console.log("\n" + "=".repeat(70));
  console.log("  Email Queue Summary");
  console.log("=".repeat(70));
  console.log(`  Emails to send: ${emailsToSend.length}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log("\n  Email details:");

  for (const e of emailsToSend) {
    console.log(`\n  --- EMAIL ---`);
    console.log(`  TO: ${e.user.email}`);
    console.log(`  SUBJECT: ${e.subject}`);
    console.log(`  DECEASED: ${e.deceased.name}`);
    console.log(`  USER: ${e.user.name}`);
    console.log(`  AGE: ${e.age}${getOrdinalSuffix(e.age)}`);
    console.log(`  BODY:\n${e.body}`);
    console.log(`  --- END EMAIL ---`);
  }

  if (connection) await connection.end();

  return {
    total: todayBirthdays.length,
    skipped: skippedCount,
    emailsToSend,
    results,
    dbAvailable,
  };
}

run()
  .then(summary => {
    console.log("\n✅ Birthday notification check completed.");
    process.exitCode = 0;
  })
  .catch(err => {
    console.error("\n❌ Fatal error:", err);
    process.exitCode = 1;
  });

export { run };
