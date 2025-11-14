/**
 * Utility functions for calculating Time to Market
 */

const WORKING_DAYS_PER_MONTH = 20;

/**
 * Get the next Monday from today
 */
function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Sunday = 0, Monday = 1

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  return nextMonday;
}

/**
 * Calculate the end date from working days
 * Assumes 20 working days per month
 */
function calculateEndDate(workingDays: number): Date {
  const startDate = getNextMonday();
  const months = workingDays / WORKING_DAYS_PER_MONTH;

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + Math.floor(months));

  // Add remaining days
  const remainingDays = (months % 1) * WORKING_DAYS_PER_MONTH;
  endDate.setDate(endDate.getDate() + Math.round(remainingDays * 1.5)); // Approximate for calendar days

  return endDate;
}

/**
 * Convert a date to descriptive text
 * Returns: "beginning of March", "middle of April", "end of May"
 */
function getDescriptiveDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];

  let period: string;
  if (day <= 10) {
    period = 'beginning';
  } else if (day <= 20) {
    period = 'middle';
  } else {
    period = 'end';
  }

  return `${period} of ${month}`;
}

/**
 * Calculate Time to Market from working days
 */
export function calculateTimeToMarket(workingDays: number): {
  descriptiveDate: string;
  months: number;
  startNextWeek: boolean;
} {
  const endDate = calculateEndDate(workingDays);
  const descriptiveDate = getDescriptiveDate(endDate);
  const months = Math.round((workingDays / WORKING_DAYS_PER_MONTH) * 10) / 10; // Round to 1 decimal

  return {
    descriptiveDate,
    months,
    startNextWeek: true,
  };
}
