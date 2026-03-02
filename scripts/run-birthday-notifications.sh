#!/bin/bash
# IMissU.app Birthday Notification Runner
# Runs daily at 9 AM via cron
# Requires: DATABASE_URL and RESEND_API_KEY environment variables

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="/var/log/imissu-birthday-notifications.log"

echo "======================================" >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting birthday notification check" >> "$LOG_FILE" 2>&1

# Load environment variables if .env file exists
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

# Run the notification script
cd "$PROJECT_DIR"
node server/birthdayNotifications.mjs >> "$LOG_FILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Birthday notification check completed" >> "$LOG_FILE" 2>&1
echo "======================================" >> "$LOG_FILE" 2>&1
