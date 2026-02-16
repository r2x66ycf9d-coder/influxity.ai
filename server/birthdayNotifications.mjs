/**
 * Birthday Notification Script for IMissU.app
 * 
 * This script checks for deceased persons whose birthday is today and sends
 * compassionate email notifications to the users who created their memorials.
 * 
 * Designed to run daily at 9 AM via cron or scheduled task.
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, isNotNull } from "drizzle-orm";
import mysql from "mysql2/promise";
import { Resend } from "resend";

// Import schema
import { 
  users, 
  deceasedPersons, 
  birthdayNotificationLogs 
} from "../drizzle/schema.js";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Get database connection
 */
async function getDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  return drizzle(connection);
}

/**
 * Check if a date matches today's month and day (ignoring year)
 */
function isBirthdayToday(dateOfBirth) {
  if (!dateOfBirth) return false;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  return (
    birthDate.getMonth() === today.getMonth() &&
    birthDate.getDate() === today.getDate()
  );
}

/**
 * Calculate age at birthday
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  return age;
}

/**
 * Generate compassionate email content
 */
function generateEmailContent(deceasedPerson, user) {
  const age = calculateAge(deceasedPerson.dateOfBirth);
  const relationship = deceasedPerson.relationship || "loved one";
  
  const subject = `Remembering ${deceasedPerson.name} Today`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .message {
          background: white;
          padding: 25px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #667eea;
        }
        .cta-button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 15px 0;
        }
        .resources {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💜 Remembering ${deceasedPerson.name}</h1>
      </div>
      
      <div class="content">
        <div class="message">
          <p>Dear ${user.name || 'Friend'},</p>
          
          <p>Today marks what would have been ${deceasedPerson.name}'s ${age}${getOrdinalSuffix(age)} birthday. 
          We know this day can bring a mix of emotions—beautiful memories intertwined with the ache of absence.</p>
          
          <p>Your ${relationship} may no longer be physically present, but the love you shared continues to live on 
          in your heart and in the memories you cherish. Today is a day to honor that connection, to remember 
          the joy they brought into your life, and to celebrate the time you had together.</p>
          
          <p><strong>Ways to honor ${deceasedPerson.name} today:</strong></p>
          <ul>
            <li>Visit their memorial page and share a favorite memory</li>
            <li>Light a candle in their honor</li>
            <li>Do something they loved or that reminds you of them</li>
            <li>Journal about a special moment you shared</li>
            <li>Connect with others who loved them</li>
          </ul>
        </div>
        
        ${deceasedPerson.memorialPageUrl ? `
        <div style="text-align: center;">
          <a href="${deceasedPerson.memorialPageUrl}" class="cta-button">
            Visit ${deceasedPerson.name}'s Memorial Page
          </a>
        </div>
        ` : ''}
        
        <div class="resources">
          <h3>💙 Grief Support Resources</h3>
          <p>Remember, grief is not linear, and it's okay to feel however you're feeling today. 
          If you need support, these resources are here for you:</p>
          <ul>
            <li><strong>Crisis Support:</strong> National Suicide Prevention Lifeline: 988</li>
            <li><strong>Grief Support:</strong> GriefShare.org - Find local support groups</li>
            <li><strong>Online Community:</strong> The Compassionate Friends - bereaved parents and siblings</li>
            <li><strong>Journaling Prompts:</strong> What would you want to tell ${deceasedPerson.name} today?</li>
          </ul>
        </div>
        
        <div class="message">
          <p><em>"What we have once enjoyed deeply we can never lose. All that we love deeply becomes a part of us."</em> 
          — Helen Keller</p>
        </div>
        
        <div class="footer">
          <p>You're not alone in your grief. We're here to support you.</p>
          <p style="font-size: 12px; margin-top: 20px;">
            You're receiving this because you've chosen to receive birthday reminders for your loved ones. 
            You can update your notification preferences in your account settings.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

/**
 * Send birthday notification email
 */
async function sendBirthdayEmail(deceasedPerson, user) {
  try {
    const { subject, html } = generateEmailContent(deceasedPerson, user);
    
    const { data, error } = await resend.emails.send({
      from: 'IMissU.app <notifications@imissu.app>',
      to: [user.email],
      subject: subject,
      html: html,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log(`✅ Email sent successfully to ${user.email} for ${deceasedPerson.name}`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Failed to send email to ${user.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Log notification attempt
 */
async function logNotification(db, deceasedPersonId, userId, type, status, errorMessage = null) {
  try {
    await db.insert(birthdayNotificationLogs).values({
      deceasedPersonId,
      userId,
      notificationType: type,
      status,
      errorMessage,
    });
  } catch (error) {
    console.error("Failed to log notification:", error);
  }
}

/**
 * Main function to check birthdays and send notifications
 */
async function checkBirthdaysAndNotify() {
  console.log("🎂 Starting birthday notification check...");
  console.log(`📅 Date: ${new Date().toLocaleDateString()}`);
  
  let db;
  try {
    // Connect to database
    db = await getDbConnection();
    console.log("✅ Database connected");
    
    // Get all deceased persons with birthdays
    const allDeceasedPersons = await db
      .select()
      .from(deceasedPersons)
      .where(isNotNull(deceasedPersons.dateOfBirth));
    
    console.log(`📊 Found ${allDeceasedPersons.length} deceased persons with birthdays on record`);
    
    // Filter to those with birthdays today
    const birthdaysToday = allDeceasedPersons.filter(person => 
      isBirthdayToday(person.dateOfBirth)
    );
    
    console.log(`🎉 Found ${birthdaysToday.length} birthdays today`);
    
    if (birthdaysToday.length === 0) {
      console.log("No birthdays to notify about today.");
      return { total: 0, sent: 0, failed: 0 };
    }
    
    let sentCount = 0;
    let failedCount = 0;
    
    // Process each birthday
    for (const deceased of birthdaysToday) {
      console.log(`\n👤 Processing: ${deceased.name} (ID: ${deceased.id})`);
      
      // Get the user who created this memorial
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, deceased.userId))
        .limit(1);
      
      if (userResult.length === 0) {
        console.log(`⚠️  User not found for deceased person ${deceased.name}`);
        continue;
      }
      
      const user = userResult[0];
      
      // Check notification preferences
      if (!user.notifyEmail) {
        console.log(`📧 Email notifications disabled for user ${user.email}`);
        continue;
      }
      
      if (!user.email) {
        console.log(`⚠️  No email address for user ID ${user.id}`);
        continue;
      }
      
      // Send email notification
      console.log(`📧 Sending email to ${user.email}...`);
      const result = await sendBirthdayEmail(deceased, user);
      
      if (result.success) {
        sentCount++;
        await logNotification(db, deceased.id, user.id, "email", "sent");
      } else {
        failedCount++;
        await logNotification(db, deceased.id, user.id, "email", "failed", result.error);
      }
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("📊 Birthday Notification Summary:");
    console.log(`   Total birthdays today: ${birthdaysToday.length}`);
    console.log(`   Emails sent: ${sentCount}`);
    console.log(`   Emails failed: ${failedCount}`);
    console.log("=".repeat(50));
    
    return {
      total: birthdaysToday.length,
      sent: sentCount,
      failed: failedCount,
    };
    
  } catch (error) {
    console.error("❌ Error in birthday notification process:", error);
    throw error;
  } finally {
    // Close database connection if it exists
    if (db) {
      try {
        await db.$client.end();
        console.log("✅ Database connection closed");
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
    }
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  checkBirthdaysAndNotify()
    .then((result) => {
      console.log("\n✅ Birthday notification check completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Birthday notification check failed:", error);
      process.exit(1);
    });
}

export { checkBirthdaysAndNotify };
