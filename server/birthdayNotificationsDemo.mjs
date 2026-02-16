/**
 * Birthday Notification Demo Script
 * 
 * This script demonstrates the birthday notification functionality
 * without requiring a real database or email service.
 */

/**
 * Mock data for demonstration
 */
const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    notifyEmail: true,
    notifySms: false,
    notifyInApp: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@example.com",
    notifyEmail: true,
    notifySms: true,
    notifyInApp: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    notifyEmail: false, // Email notifications disabled
    notifySms: false,
    notifyInApp: true,
  },
];

// Create deceased persons with birthdays - some today, some not
const today = new Date();
const todayMonth = today.getMonth();
const todayDay = today.getDate();

const mockDeceasedPersons = [
  {
    id: 1,
    userId: 1,
    name: "Robert Johnson",
    relationship: "father",
    dateOfBirth: new Date(1955, todayMonth, todayDay), // Birthday TODAY
    dateOfDeath: new Date(2022, 5, 15),
    memorialPageUrl: "https://imissu.app/memorial/robert-johnson",
  },
  {
    id: 2,
    userId: 2,
    name: "Lisa Chen",
    relationship: "mother",
    dateOfBirth: new Date(1960, todayMonth, todayDay), // Birthday TODAY
    dateOfDeath: new Date(2023, 8, 20),
    memorialPageUrl: "https://imissu.app/memorial/lisa-chen",
  },
  {
    id: 3,
    userId: 3,
    name: "David Rodriguez",
    relationship: "husband",
    dateOfBirth: new Date(1978, todayMonth, todayDay), // Birthday TODAY but user has email disabled
    dateOfDeath: new Date(2024, 1, 10),
    memorialPageUrl: "https://imissu.app/memorial/david-rodriguez",
  },
  {
    id: 4,
    userId: 1,
    name: "Margaret Smith",
    relationship: "grandmother",
    dateOfBirth: new Date(1935, 5, 10), // NOT today
    dateOfDeath: new Date(2020, 11, 25),
    memorialPageUrl: "https://imissu.app/memorial/margaret-smith",
  },
];

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
 * Generate email preview (text version for demo)
 */
function generateEmailPreview(deceasedPerson, user) {
  const age = calculateAge(deceasedPerson.dateOfBirth);
  const relationship = deceasedPerson.relationship || "loved one";
  
  return `
${"=".repeat(70)}
TO: ${user.email}
FROM: IMissU.app <notifications@imissu.app>
SUBJECT: Remembering ${deceasedPerson.name} Today
${"=".repeat(70)}

Dear ${user.name || 'Friend'},

Today marks what would have been ${deceasedPerson.name}'s ${age}${getOrdinalSuffix(age)} birthday.
We know this day can bring a mix of emotions—beautiful memories 
intertwined with the ache of absence.

Your ${relationship} may no longer be physically present, but the love 
you shared continues to live on in your heart and in the memories you 
cherish. Today is a day to honor that connection, to remember the joy 
they brought into your life, and to celebrate the time you had together.

Ways to honor ${deceasedPerson.name} today:
• Visit their memorial page and share a favorite memory
• Light a candle in their honor
• Do something they loved or that reminds you of them
• Journal about a special moment you shared
• Connect with others who loved them

${deceasedPerson.memorialPageUrl ? `
🔗 Visit Memorial Page: ${deceasedPerson.memorialPageUrl}
` : ''}

💙 Grief Support Resources:
• Crisis Support: National Suicide Prevention Lifeline: 988
• Grief Support: GriefShare.org - Find local support groups
• Online Community: The Compassionate Friends
• Journaling Prompt: What would you want to tell ${deceasedPerson.name} today?

"What we have once enjoyed deeply we can never lose. 
All that we love deeply becomes a part of us." — Helen Keller

You're not alone in your grief. We're here to support you.

${"=".repeat(70)}
`;
}

/**
 * Demo function to simulate birthday notification process
 */
function runBirthdayNotificationDemo() {
  console.log("\n" + "=".repeat(70));
  console.log("🎂 BIRTHDAY NOTIFICATION SYSTEM - DEMONSTRATION");
  console.log("=".repeat(70));
  console.log(`📅 Current Date: ${new Date().toLocaleDateString()}`);
  console.log(`📊 Total Deceased Persons in Database: ${mockDeceasedPersons.length}`);
  console.log(`👥 Total Users in Database: ${mockUsers.length}`);
  console.log("=".repeat(70));
  
  // Filter to birthdays today
  const birthdaysToday = mockDeceasedPersons.filter(person => 
    isBirthdayToday(person.dateOfBirth)
  );
  
  console.log(`\n🎉 BIRTHDAYS TODAY: ${birthdaysToday.length}`);
  
  if (birthdaysToday.length === 0) {
    console.log("No birthdays to notify about today.");
    return { total: 0, sent: 0, skipped: 0, failed: 0 };
  }
  
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  
  const notifications = [];
  
  // Process each birthday
  for (const deceased of birthdaysToday) {
    console.log(`\n${"─".repeat(70)}`);
    console.log(`👤 Processing: ${deceased.name}`);
    console.log(`   Relationship: ${deceased.relationship}`);
    console.log(`   Birth Date: ${deceased.dateOfBirth.toLocaleDateString()}`);
    console.log(`   Age Today: ${calculateAge(deceased.dateOfBirth)}`);
    
    // Find the user
    const user = mockUsers.find(u => u.id === deceased.userId);
    
    if (!user) {
      console.log(`   ⚠️  Status: SKIPPED - User not found`);
      skippedCount++;
      continue;
    }
    
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Email Notifications: ${user.notifyEmail ? 'ENABLED' : 'DISABLED'}`);
    
    // Check notification preferences
    if (!user.notifyEmail) {
      console.log(`   ⏭️  Status: SKIPPED - Email notifications disabled`);
      skippedCount++;
      continue;
    }
    
    if (!user.email) {
      console.log(`   ⚠️  Status: SKIPPED - No email address`);
      skippedCount++;
      continue;
    }
    
    // Simulate sending email
    console.log(`   ✅ Status: EMAIL SENT`);
    sentCount++;
    
    // Store notification for preview
    notifications.push({
      deceased,
      user,
      preview: generateEmailPreview(deceased, user),
    });
  }
  
  // Display summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 NOTIFICATION SUMMARY");
  console.log("=".repeat(70));
  console.log(`   Total Birthdays Today: ${birthdaysToday.length}`);
  console.log(`   ✅ Emails Sent: ${sentCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log("=".repeat(70));
  
  // Display email previews
  if (notifications.length > 0) {
    console.log("\n" + "=".repeat(70));
    console.log("📧 EMAIL PREVIEWS");
    console.log("=".repeat(70));
    
    notifications.forEach((notification, index) => {
      console.log(`\n[Email ${index + 1} of ${notifications.length}]`);
      console.log(notification.preview);
    });
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("✅ DEMO COMPLETED SUCCESSFULLY");
  console.log("=".repeat(70));
  console.log("\nNote: This is a demonstration. No actual emails were sent.");
  console.log("In production, emails would be sent via Resend API.");
  console.log("=".repeat(70) + "\n");
  
  return {
    total: birthdaysToday.length,
    sent: sentCount,
    skipped: skippedCount,
    failed: failedCount,
    notifications,
  };
}

// Run the demo
const result = runBirthdayNotificationDemo();

// Export for testing
export { runBirthdayNotificationDemo, mockUsers, mockDeceasedPersons };
