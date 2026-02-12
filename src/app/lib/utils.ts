import locales from "@/i18n/locales.json";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { parse } from "date-fns";

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
  date: Date,
  userTimezone: string,
  locale: string = "en-GB",
) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: userTimezone,
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
 * @param selectedDate - The date selected by user as local date (as Date or string "YYYY-MM-DD")
 * @param userTimezone - User's timezone (e.g., "America/Mexico_City")
 * @returns Date object representing the UTC equivalent of the local time
 */
export function getTransactionDateWithTime(
  selectedDate: Date | string,
  userTimezone: string,
  locale: string = "en-US",
): Date {
  let dateObj: Date;

  if (typeof selectedDate === "string") {
    // Parse depending on locale using date-fns
    // en-US uses MM/dd/yyyy, other locales (like es-MX) use dd/MM/yyyy
    const dateFormat = locales.filter((l) => l.key === locale)[0]
      .dateFormatSimple;
    dateObj = parse(selectedDate, dateFormat, new Date());
    // If parsing fails, return something that will trigger validation error later
    if (isNaN(dateObj.getTime())) {
      return new Date("invalid");
    }
  } else {
    dateObj = selectedDate;
  }

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  // Get today's date in local time
  const today = new Date();
  const zonedToday = toZonedTime(today, userTimezone);
  const isToday =
    year === zonedToday.getFullYear() &&
    month === zonedToday.getMonth() &&
    day === zonedToday.getDate();
  if (isToday) {
    // For today: just pass the current date
    const now = new Date();
    return now;
  } else {
    // For past dates: midnight in user's timezone, then convert to UTC
    const local = new Date(year, month, day, 0, 0, 0, 0);
    const zoned = fromZonedTime(local, userTimezone);
    return zoned;
  }
}

export function getDateForUpdateTransaction(
  existingDate: Date,
  newDate: Date | string,
  userTimezone: string,
  locale: string = "en-US",
): Date {
  // Get dates in user's timezone
  const existingDateInUserTz = toZonedTime(existingDate, userTimezone);

  let dateObj: Date;

  if (typeof newDate === "string") {
    // Parse depending on locale using date-fns
    // en-US uses MM/dd/yyyy, other locales (like es-MX) use dd/MM/yyyy
    const dateFormat = locales.filter((l) => l.key === locale)[0]
      .dateFormatSimple;
    dateObj = parse(newDate, dateFormat, new Date());
    // If parsing fails, return something that will trigger validation error later
    if (isNaN(dateObj.getTime())) {
      return new Date("invalid");
    }
  } else {
    dateObj = newDate;
  }

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  const isSameDate =
    year === existingDateInUserTz.getFullYear() &&
    month === existingDateInUserTz.getMonth() &&
    day === existingDateInUserTz.getDate();

  let finalTimestamp: Date;

  // If date hasn't changed, preserve the existing time
  if (isSameDate) {
    finalTimestamp = existingDate;
  } else {
    // Date changed
    const local = new Date(year, month, day, 0, 0, 0, 0);
    const zoned = fromZonedTime(local, userTimezone);

    finalTimestamp = zoned;
  }
  return finalTimestamp;
}
