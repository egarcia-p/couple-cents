import locales from "@/i18n/locales.json";

export const formatCurrency = async (
  amount: number,
  isCents: boolean = true,
  locale: string,
) => {
  if (isCents) {
    // If the amount is in cents, convert it to $ base 100
    amount = amount / 100;
  }

  const currencyCode = getCurrencyFromLocale(locale);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

export const formatPercentage = (percentage: number) => {
  return percentage.toLocaleString("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-GB",
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export function getCurrencyFromLocale(locale: string): string {
  const found = (locales as Array<{ key: string; currency: string }>).find(
    (l) => l.key === locale,
  );
  return found ? found.currency : "USD"; // fallback to USD if not found
}

/**
 * Combines a selected date with current time in user's timezone.
 * For today's date: uses current time in user's timezone
 * For past dates: uses 00:00:00 (midnight) in user's timezone
 *
 * @param selectedDate - The date selected by user (as Date or string "YYYY-MM-DD")
 * @param userTimezone - User's timezone (e.g., "America/Mexico_City")
 * @returns Date object with time component, ready for database storage
 */
export function getTransactionDateWithTime(
  selectedDate: Date | string,
  userTimezone: string,
): Date {
  const { formatInTimeZone, toZonedTime } = require("date-fns-tz");

  // Parse selected date
  let dateObj: Date;
  if (typeof selectedDate === "string") {
    dateObj = new Date(selectedDate);
  } else {
    dateObj = selectedDate;
  }

  // Get today's date at midnight UTC
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  // Get selected date at midnight UTC (for comparison)
  const selectedDateAtMidnightUTC = new Date(dateObj);
  selectedDateAtMidnightUTC.setUTCHours(0, 0, 0, 0);

  // Compare dates (comparing midnight UTC versions)
  const isToday =
    todayUTC.getTime() === selectedDateAtMidnightUTC.getTime();

  let resultDate: Date;

  if (isToday) {
    // For today: use current time in user's timezone
    const now = new Date();
    const zonedNow = toZonedTime(now, userTimezone);
    resultDate = zonedNow;
  } else {
    // For past dates: use 00:00:00 in user's timezone
    const zonedDate = toZonedTime(dateObj, userTimezone);
    zonedDate.setHours(0, 0, 0, 0);
    resultDate = zonedDate;
  }

  return resultDate;
}
