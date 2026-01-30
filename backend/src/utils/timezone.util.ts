/**
 * Get current date in YYYY-MM-DD format for a specific timezone
 * @param timezone - IANA timezone string (e.g., 'Asia/Kolkata', 'America/New_York')
 * @returns Date string in YYYY-MM-DD format
 */
export function getTodayInTimezone(timezone: string): string {
  const now = new Date();

  // Get date parts in the user's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // en-CA format gives us YYYY-MM-DD directly
  return formatter.format(now);
}

/**
 * Get a date offset by days in a specific timezone
 * @param timezone - IANA timezone string
 * @param daysOffset - Number of days to offset (negative for past, positive for future)
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateInTimezone(timezone: string, daysOffset: number = 0): string {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(now);
}

/**
 * Validate if a string is a valid IANA timezone
 * @param timezone - Timezone string to validate
 * @returns boolean
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user's timezone from browser (to be called from frontend)
 * @returns IANA timezone string
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
