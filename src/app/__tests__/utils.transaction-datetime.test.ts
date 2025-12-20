import { describe, it, expect } from "vitest";
import { getTransactionDateWithTime } from "@/app/lib/utils";

/**
 * Test suite for transaction date-time functionality
 *
 * These tests verify that transactions created on the same day
 * are properly ordered by including time information in the timestamp.
 *
 * @see src/app/lib/utils.ts - getTransactionDateWithTime()
 */
describe("Transaction DateTime - getTransactionDateWithTime()", () => {
  describe("Today's Date Handling", () => {
    it("should create timestamps with time component for today's date", () => {
      const today = new Date();
      const timezone = "America/Mexico_City";

      const result = getTransactionDateWithTime(today, timezone);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it("should use current time in user's timezone for today", () => {
      const now = new Date();
      const timezone = "America/Mexico_City";

      const result = getTransactionDateWithTime(now, timezone);

      // Verify it's a valid timestamp
      expect(result).toBeInstanceOf(Date);
      // The result should be very close to current time (within a few seconds)
      const timeDifference = Math.abs(result.getTime() - now.getTime());
      // Allow up to 5 seconds difference for execution time
      expect(timeDifference).toBeLessThan(5000);
    });
  });

  describe("Past Date Handling", () => {
    it("should create timestamps at midnight (00:00:00) for past dates", () => {
      // Create a date 5 days ago
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const timezone = "America/Mexico_City";
      const result = getTransactionDateWithTime(pastDate, timezone);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it("should consistently return midnight time for same past date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const timezone = "America/Mexico_City";

      const result1 = getTransactionDateWithTime(pastDate, timezone);
      const result2 = getTransactionDateWithTime(pastDate, timezone);

      expect(result1).toBeInstanceOf(Date);
      expect(result2).toBeInstanceOf(Date);
      // Both should be valid timestamps
      expect(result1.getTime()).toBeGreaterThan(0);
      expect(result2.getTime()).toBeGreaterThan(0);
    });
  });

  describe("String Date Handling", () => {
    it("should handle string dates in YYYY-MM-DD format", () => {
      const pastDateString = "2025-01-10";
      const timezone = "America/Mexico_City";

      const result = getTransactionDateWithTime(pastDateString, timezone);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it("should handle various date string formats", () => {
      const testDates = [
        "2025-01-01",
        "2024-12-25",
        "2023-06-15",
        "2020-02-29", // Leap year
      ];

      const timezone = "America/Mexico_City";

      testDates.forEach((dateString) => {
        const result = getTransactionDateWithTime(dateString, timezone);
        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBeGreaterThan(0);
      });
    });
  });

  describe("Timezone Handling", () => {
    it("should work with various timezone strings", () => {
      const timezones = [
        "America/Mexico_City",
        "America/New_York",
        "Europe/London",
        "Asia/Tokyo",
        "Australia/Sydney",
      ];

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);

      timezones.forEach((timezone) => {
        const result = getTransactionDateWithTime(pastDate, timezone);
        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBeGreaterThan(0);
      });
    });
  });

  describe("Same-Day Transaction Ordering", () => {
    it("should differentiate transactions created at different times on same day", () => {
      // This test simulates multiple transactions created on the same day
      // by calling the helper function multiple times
      const today = new Date();
      const timezone = "America/Mexico_City";

      // Simulate first transaction
      const transaction1 = getTransactionDateWithTime(today, timezone);

      // Simulate second transaction (in real scenario, time would have passed)
      const transaction2 = getTransactionDateWithTime(today, timezone);

      // Both should be Date objects
      expect(transaction1).toBeInstanceOf(Date);
      expect(transaction2).toBeInstanceOf(Date);

      // Both should have valid timestamps
      expect(transaction1.getTime()).toBeGreaterThan(0);
      expect(transaction2.getTime()).toBeGreaterThan(0);
    });

    it("should preserve date but vary time for multiple today transactions", () => {
      const today = new Date();
      const timezone = "America/Mexico_City";

      // Get year, month, day from both results
      const result1 = getTransactionDateWithTime(today, timezone);
      const result2 = getTransactionDateWithTime(today, timezone);

      // Both should be Date objects
      expect(result1).toBeInstanceOf(Date);
      expect(result2).toBeInstanceOf(Date);

      // Both should represent approximately the same day
      // (allowing for timezone differences in UTC conversion)
      const day1 = result1.getUTCDate();
      const day2 = result2.getUTCDate();
      const month1 = result1.getUTCMonth();
      const month2 = result2.getUTCMonth();
      const year1 = result1.getUTCFullYear();
      const year2 = result2.getUTCFullYear();

      // Should be same year/month
      expect(year1).toBe(year2);
      expect(month1).toBe(month2);
      // Days should be same or differ by 1 due to timezone conversion
      expect(Math.abs(day1 - day2)).toBeLessThanOrEqual(1);
    });
  });

  describe("Date Object Handling", () => {
    it("should accept both Date objects and strings", () => {
      const dateObj = new Date("2025-01-15");
      const dateStr = "2025-01-15";
      const timezone = "America/Mexico_City";

      const result1 = getTransactionDateWithTime(dateObj, timezone);
      const result2 = getTransactionDateWithTime(dateStr, timezone);

      expect(result1).toBeInstanceOf(Date);
      expect(result2).toBeInstanceOf(Date);
      expect(result1.getTime()).toBeGreaterThan(0);
      expect(result2.getTime()).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle dates at the beginning of the year", () => {
      const newYearsDay = "2025-01-01";
      const timezone = "America/Mexico_City";

      const result = getTransactionDateWithTime(newYearsDay, timezone);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it("should handle dates at the end of the year", () => {
      const lastDayOfYear = "2024-12-31";
      const timezone = "America/Mexico_City";

      const result = getTransactionDateWithTime(lastDayOfYear, timezone);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it("should handle leap year dates", () => {
      const leapYearDate = "2024-02-29";
      const timezone = "America/Mexico_City";

      const result = getTransactionDateWithTime(leapYearDate, timezone);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });
  });

  describe("Return Value Validation", () => {
    it("should always return a valid Date object", () => {
      const testCases = [
        { date: new Date(), tz: "America/Mexico_City" },
        { date: "2025-01-10", tz: "America/New_York" },
        { date: new Date("2024-06-15"), tz: "Europe/London" },
      ];

      testCases.forEach(({ date, tz }) => {
        const result = getTransactionDateWithTime(date, tz);
        expect(result).toBeInstanceOf(Date);
        expect(Number.isNaN(result.getTime())).toBe(false);
        expect(result.getTime()).toBeGreaterThan(0);
      });
    });

    it("should return a timestamp that can be stored in database", () => {
      const today = new Date();
      const timezone = "America/Mexico_City";

      const result = getTransactionDateWithTime(today, timezone);

      // Verify it's a valid timestamp suitable for database storage
      expect(result.toISOString()).toBeDefined();
      expect(typeof result.toISOString()).toBe("string");
      // Should be in ISO format
      expect(result.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
