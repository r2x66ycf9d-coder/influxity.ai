# IMissU.app Birthday Notification System

## Overview

The IMissU.app birthday notification system sends automated, compassionate email reminders to users on their deceased loved ones' birthdays. This feature helps users honor and remember their loved ones on significant dates while providing grief support resources.

## System Architecture

### Database Schema

The system uses three main database tables:

#### 1. `users` Table (Extended)
Added notification preference fields:
- `notifyEmail` (boolean, default: true) - Enable/disable email notifications
- `notifySms` (boolean, default: false) - Enable/disable SMS notifications  
- `notifyInApp` (boolean, default: true) - Enable/disable in-app notifications

#### 2. `deceasedPersons` Table (New)
Stores information about deceased loved ones:
- `id` - Primary key
- `userId` - Foreign key to users table
- `name` - Name of the deceased person
- `relationship` - Relationship to the user (e.g., "father", "mother", "spouse")
- `dateOfBirth` - Birth date (used for birthday matching)
- `dateOfDeath` - Date of passing
- `memorialPageUrl` - URL to the memorial page
- `createdAt` - Record creation timestamp
- `updatedAt` - Record update timestamp

#### 3. `birthdayNotificationLogs` Table (New)
Tracks all notification attempts:
- `id` - Primary key
- `deceasedPersonId` - Foreign key to deceasedPersons
- `userId` - Foreign key to users
- `notificationType` - Type: "email", "sms", or "in_app"
- `sentAt` - Timestamp of notification attempt
- `status` - Status: "sent" or "failed"
- `errorMessage` - Error details if failed

### Files

1. **`/drizzle/schema.ts`** - Database schema definitions
2. **`/server/birthdayNotifications.mjs`** - Production notification script
3. **`/server/birthdayNotificationsDemo.mjs`** - Demo/testing script

## How It Works

### Birthday Checking Logic

1. **Daily Execution**: Script runs daily at 9 AM (configured via cron/scheduler)
2. **Query Database**: Fetches all deceased persons with non-null `dateOfBirth`
3. **Date Matching**: Filters to those whose birth month and day match today (year ignored)
4. **User Lookup**: For each match, retrieves the associated user
5. **Preference Check**: Verifies user has `notifyEmail` enabled and valid email
6. **Send Email**: Sends compassionate notification via Resend API
7. **Logging**: Records all attempts in `birthdayNotificationLogs`

### Email Content

Each notification includes:
- **Personalized greeting** with user's name
- **Age calculation** (what age they would be today)
- **Compassionate message** acknowledging grief and celebrating memories
- **Suggestions** for honoring their loved one:
  - Visit memorial page
  - Light a candle
  - Share memories
  - Journal
  - Connect with others
- **Memorial page link** (if available)
- **Grief support resources**:
  - Crisis hotline (988)
  - GriefShare.org
  - The Compassionate Friends
  - Journaling prompts
- **Inspirational quote**
- **Preference management** note

## Setup Instructions

### Prerequisites

1. **Node.js** 18+ with ES modules support
2. **MySQL Database** with schema deployed
3. **Resend Account** for email delivery
4. **Environment Variables** configured

### Environment Variables

Create a `.env` file with:

```bash
# Database connection
DATABASE_URL=mysql://username:password@host:port/database_name

# Resend API key for email delivery
RESEND_API_KEY=re_your_api_key_here
```

### Installation

```bash
# Install dependencies
pnpm install

# Deploy database schema
pnpm drizzle-kit push:mysql

# Test the system (demo mode)
node server/birthdayNotificationsDemo.mjs

# Run production check
node server/birthdayNotifications.mjs
```

### Scheduling

#### Using Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 9 AM
0 9 * * * cd /path/to/influxity.ai && node server/birthdayNotifications.mjs >> /var/log/birthday-notifications.log 2>&1
```

#### Using Node Scheduler

```javascript
import cron from 'node-cron';
import { checkBirthdaysAndNotify } from './server/birthdayNotifications.mjs';

// Run daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running birthday notification check...');
  await checkBirthdaysAndNotify();
});
```

## Email Template Features

### Compassionate Design
- **Gradient header** with memorial theme
- **Warm, supportive tone** throughout
- **Professional typography** (Georgia serif font)
- **Accessible color scheme** (purple/blue palette)
- **Mobile-responsive** layout

### Personalization
- User's name in greeting
- Deceased person's name and relationship
- Calculated age (e.g., "71st birthday")
- Memorial page link (if available)

### Support Resources
- **Crisis support**: 988 Suicide Prevention Lifeline
- **Grief support groups**: GriefShare.org
- **Online communities**: The Compassionate Friends
- **Journaling prompts**: Therapeutic writing suggestions

## Testing

### Demo Mode

The demo script (`birthdayNotificationsDemo.mjs`) simulates the system without requiring database or email service:

```bash
node server/birthdayNotificationsDemo.mjs
```

**Demo Features:**
- Mock data with 3 users and 4 deceased persons
- Automatically sets birthdays to today's date
- Shows email previews in console
- Tests notification preference logic
- No actual emails sent

### Test Output

```
======================================================================
🎂 BIRTHDAY NOTIFICATION SYSTEM - DEMONSTRATION
======================================================================
📅 Current Date: 2/16/2026
📊 Total Deceased Persons in Database: 4
👥 Total Users in Database: 3
======================================================================

🎉 BIRTHDAYS TODAY: 3

──────────────────────────────────────────────────────────────────────
👤 Processing: Robert Johnson
   Relationship: father
   Birth Date: 2/16/1955
   Age Today: 71
   User: Sarah Johnson (sarah.johnson@example.com)
   Email Notifications: ENABLED
   ✅ Status: EMAIL SENT
──────────────────────────────────────────────────────────────────────

📊 NOTIFICATION SUMMARY
======================================================================
   Total Birthdays Today: 3
   ✅ Emails Sent: 2
   ⏭️  Skipped: 1
   ❌ Failed: 0
======================================================================
```

## Production Deployment

### Database Migration

```bash
# Generate migration
pnpm drizzle-kit generate:mysql

# Apply migration
pnpm drizzle-kit push:mysql
```

### Resend Configuration

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (e.g., `imissu.app`)
3. Create API key
4. Add to environment variables
5. Configure sender email: `notifications@imissu.app`

### Monitoring

The script logs all activity:
- ✅ Successful email sends
- ❌ Failed attempts with error messages
- ⚠️ Skipped notifications (preferences disabled, missing email)
- 📊 Daily summary statistics

**Log locations:**
- Console output (stdout)
- Database: `birthdayNotificationLogs` table
- Optional: External logging service (Sentry, LogRocket, etc.)

## Error Handling

The system handles errors gracefully:

1. **Database Connection Failures**: Logs error, exits with code 1
2. **Email Send Failures**: Logs to database, continues processing other notifications
3. **Missing User Data**: Skips notification, logs warning
4. **Invalid Email Addresses**: Caught by Resend, logged as failed

## User Privacy & Preferences

### Notification Preferences

Users can control notifications via their account settings:
- **Email**: Toggle `notifyEmail` field
- **SMS**: Toggle `notifySms` field (future feature)
- **In-App**: Toggle `notifyInApp` field (future feature)

### Data Privacy

- All deceased person data is user-specific (userId foreign key)
- Users can only see/manage their own memorials
- Email addresses never shared with third parties
- Notification logs retained for analytics only

## Future Enhancements

### Planned Features

1. **SMS Notifications**: Via Twilio integration
2. **In-App Notifications**: Push notifications in web/mobile app
3. **Custom Messages**: Users can write personal birthday messages in advance
4. **Photo Attachments**: Include photos in birthday emails
5. **Anniversary Notifications**: Death anniversary reminders
6. **Multi-Language Support**: Localized email templates
7. **Time Zone Support**: Send at 9 AM in user's local time
8. **Batch Processing**: Optimize for large user bases

### Analytics

Track metrics:
- Total notifications sent per day/month/year
- Open rates (via email tracking pixels)
- Click-through rates (memorial page visits)
- User engagement with grief resources
- Notification preference trends

## Support & Maintenance

### Common Issues

**Issue**: No emails being sent
- **Check**: DATABASE_URL and RESEND_API_KEY environment variables
- **Check**: Resend domain verification status
- **Check**: User notification preferences

**Issue**: Wrong birthdays triggered
- **Check**: Server timezone configuration
- **Check**: Date format in database (should be MySQL timestamp)

**Issue**: Emails going to spam
- **Solution**: Configure SPF, DKIM, and DMARC records for your domain
- **Solution**: Use verified Resend domain

### Contact

For technical support or feature requests:
- Email: support@imissu.app
- GitHub: [Repository Issues](https://github.com/r2x66ycf9d-coder/influxity.ai/issues)

## License

This birthday notification system is part of the IMissU.app grief support platform.

---

**Last Updated**: February 16, 2026  
**Version**: 1.0.0  
**Maintainer**: Development Team
