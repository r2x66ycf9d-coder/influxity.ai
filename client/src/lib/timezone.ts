import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Get the user's current timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Format UTC time to user's local timezone
 * @param utcTime - UTC timestamp (string or Date)
 * @param formatStr - date-fns format string (default: 'PPpp')
 */
export const formatLocalTime = (utcTime: string | Date, formatStr: string = 'PPpp'): string => {
  const timezone = getUserTimezone();
  const date = typeof utcTime === 'string' ? parseISO(utcTime) : utcTime;
  return formatInTimeZone(date, timezone, formatStr);
};

/**
 * Convert local time to UTC for storage
 * @param localTime - Local Date object
 */
export const toUTC = (localTime: Date): Date => {
  const timezone = getUserTimezone();
  return fromZonedTime(localTime, timezone);
};

/**
 * Convert UTC to local time for display
 * @param utcTime - UTC Date object
 */
export const toLocalTime = (utcTime: Date): Date => {
  const timezone = getUserTimezone();
  return toZonedTime(utcTime, timezone);
};

/**
 * Format meeting/event time with full details
 * Example: "Monday, January 15, 2024 at 2:30 PM"
 */
export const formatMeetingTime = (utcTime: string | Date): string => {
  return formatLocalTime(utcTime, "EEEE, MMMM d, yyyy 'at' h:mm a");
};

/**
 * Format short time for lists and compact displays
 * Example: "Jan 15, 2:30 PM"
 */
export const formatShortTime = (utcTime: string | Date): string => {
  return formatLocalTime(utcTime, 'MMM d, h:mm a');
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (utcTime: string | Date): string => {
  const date = typeof utcTime === 'string' ? parseISO(utcTime) : utcTime;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatShortTime(date);
};
