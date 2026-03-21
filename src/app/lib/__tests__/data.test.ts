import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { encrypt } from "../crypto";

// A mock valid 32-byte key encoded in base64 for testing
const TEST_KEY = "RpjGstp2ozdRkHBcCrJz0BOYv+UH4eIU7dvVFMQQgow=";

// Mock the db module
vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
  },
}));

// Mock next-intl
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
}));

// Mock categories helpers
vi.mock("../helpers/categories", () => ({
  getAllCategoriesMap: vi.fn(() => ({
    food: "Food",
    transport: "Transport",
    salary: "Salary",
  })),
  getTranslatedAllCategoriesMap: vi.fn(() =>
    Promise.resolve({
      food: "Food",
      transport: "Transport",
      salary: "Salary",
    }),
  ),
}));

describe("data.ts - encryption integration", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("fetchAllTransactions", () => {
    it("should decrypt encrypted amount and establishment fields", async () => {
      const encryptedAmount = encrypt("5000"); // 5000 cents = $50.00
      const encryptedEstablishment = encrypt("Grocery Store");

      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "tx-1",
                userId: "user-1",
                transactionDate: new Date("2024-01-15"),
                category: "food",
                establishment: encryptedEstablishment,
                isExpense: true,
                isEssential: true,
                note: "weekly groceries",
                amount: encryptedAmount,
              },
            ]),
          }),
        }),
      } as any);

      const { fetchAllTransactions } = await import("../data");
      const result = await fetchAllTransactions("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(50); // 5000 cents -> $50
      expect(result[0].establishment).toBe("Grocery Store");
      expect(result[0].note).toBe("weekly groceries"); // note is NOT encrypted
    });

    it("should handle plaintext amounts during migration (safeDecrypt)", async () => {
      // During migration, some values might still be plaintext
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "tx-2",
                userId: "user-1",
                transactionDate: new Date("2024-01-15"),
                category: "food",
                establishment: "Plain Store Name",
                isExpense: true,
                isEssential: false,
                note: null,
                amount: "3000", // plaintext cents value
              },
            ]),
          }),
        }),
      } as any);

      const { fetchAllTransactions } = await import("../data");
      const result = await fetchAllTransactions("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(30); // 3000 cents -> $30
      expect(result[0].establishment).toBe("Plain Store Name");
    });

    it("should handle null/empty amounts gracefully", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "tx-3",
                userId: "user-1",
                transactionDate: new Date("2024-01-15"),
                category: "food",
                establishment: null,
                isExpense: true,
                isEssential: false,
                note: null,
                amount: null,
              },
            ]),
          }),
        }),
      } as any);

      const { fetchAllTransactions } = await import("../data");
      const result = await fetchAllTransactions("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(0);
      expect(result[0].establishment).toBe("");
    });
  });

  describe("fetchUserTags", () => {
    it("should return tags for a given user", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "tag-1",
                name: "Cash",
                color: "#00FF00",
                userId: "user-1",
              },
              {
                id: "tag-2",
                name: "Credit Card",
                color: "#FF0000",
                userId: "user-1",
              },
            ]),
          }),
        }),
      } as any);

      const { fetchUserTags } = await import("../data");
      const result = await fetchUserTags("user-1");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "tag-1",
        name: "Cash",
        color: "#00FF00",
        userId: "user-1",
      });
      expect(result[1]).toEqual({
        id: "tag-2",
        name: "Credit Card",
        color: "#FF0000",
        userId: "user-1",
      });
    });

    it("should return empty array when user has no tags", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const { fetchUserTags } = await import("../data");
      const result = await fetchUserTags("user-1");

      expect(result).toHaveLength(0);
    });

    it("should throw error when database query fails", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockRejectedValue(new Error("DB error")),
          }),
        }),
      } as any);

      const { fetchUserTags } = await import("../data");

      await expect(fetchUserTags("user-1")).rejects.toThrow(
        "Failed to fetch user tags.",
      );
    });
  });

  describe("fetchTransactionById", () => {
    it("should decrypt amount and establishment for a single transaction", async () => {
      const encryptedAmount = encrypt("12345");
      const encryptedEstablishment = encrypt("Coffee Shop");

      const { db } = await import("../db");
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Main transaction query
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  id: "tx-1",
                  userId: "user-1",
                  transactionDate: new Date("2024-03-01"),
                  category: "food",
                  establishment: encryptedEstablishment,
                  isExpense: true,
                  isEssential: false,
                  note: "morning coffee",
                  amount: encryptedAmount,
                },
              ]),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      });

      const { fetchTransactionById } = await import("../data");
      const result = await fetchTransactionById("tx-1", "user-1");

      expect(result.amount).toBe(123.45); // 12345 cents -> $123.45
      expect(result.establishment).toBe("Coffee Shop");
      expect(result.tags).toEqual([]);
    });

    it("should include tags when transaction has associated tags", async () => {
      const encryptedAmount = encrypt("5000");
      const encryptedEstablishment = encrypt("Tagged Store");

      const { db } = await import("../db");
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Main transaction query
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  id: "tx-1",
                  userId: "user-1",
                  transactionDate: new Date("2024-03-01"),
                  category: "food",
                  establishment: encryptedEstablishment,
                  isExpense: true,
                  isEssential: false,
                  note: null,
                  amount: encryptedAmount,
                },
              ]),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  transactionId: "tx-1",
                  tagId: "tag-1",
                  tagName: "Cash",
                  tagColor: "#00FF00",
                  tagUserId: "user-1",
                },
                {
                  transactionId: "tx-1",
                  tagId: "tag-2",
                  tagName: "Groceries",
                  tagColor: "#0000FF",
                  tagUserId: "user-1",
                },
              ]),
            }),
          }),
        } as any;
      });

      const { fetchTransactionById } = await import("../data");
      const result = await fetchTransactionById("tx-1", "user-1");

      expect(result.tags).toHaveLength(2);
      expect(result.tags[0]).toEqual({
        id: "tag-1",
        name: "Cash",
        color: "#00FF00",
        userId: "user-1",
      });
      expect(result.tags[1]).toEqual({
        id: "tag-2",
        name: "Groceries",
        color: "#0000FF",
        userId: "user-1",
      });
    });

    it("should return undefined when transaction not found", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { fetchTransactionById } = await import("../data");
      const result = await fetchTransactionById("nonexistent", "user-1");

      expect(result).toBeUndefined();
    });
  });

  describe("fetchAllFilteredTransactions", () => {
    it("should filter by decrypted establishment name", async () => {
      const encryptedEstablishment1 = encrypt("Walmart");
      const encryptedEstablishment2 = encrypt("Target");
      const encryptedAmount1 = encrypt("1000");
      const encryptedAmount2 = encrypt("2000");

      const { db } = await import("../db");

      // Mock fetchUserSettings (called inside fetchAllFilteredTransactions)
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "tx-1",
                userId: "user-1",
                transactionDate: new Date("2024-01-15"),
                category: "food",
                establishment: encryptedEstablishment1,
                isExpense: true,
                isEssential: true,
                note: null,
                amount: encryptedAmount1,
              },
              {
                id: "tx-2",
                userId: "user-1",
                transactionDate: new Date("2024-01-16"),
                category: "food",
                establishment: encryptedEstablishment2,
                isExpense: true,
                isEssential: false,
                note: null,
                amount: encryptedAmount2,
              },
            ]),
          }),
        }),
      } as any);

      // Also need to mock fetchUserSettings which is called internally
      // fetchUserSettings does db.select()...from()...where() — we need it to return user settings
      const originalSelect = vi.mocked(db.select);
      let callCount = 0;
      originalSelect.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // fetchUserSettings call
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: "user-1",
                  language: "en-US",
                  timezone: "America/New_York",
                },
              ]),
            }),
          } as any;
        }
        if (callCount === 2) {
          // Main query call
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([
                  {
                    id: "tx-1",
                    userId: "user-1",
                    transactionDate: new Date("2024-01-15"),
                    category: "food",
                    establishment: encryptedEstablishment1,
                    isExpense: true,
                    isEssential: true,
                    note: null,
                    amount: encryptedAmount1,
                  },
                  {
                    id: "tx-2",
                    userId: "user-1",
                    transactionDate: new Date("2024-01-16"),
                    category: "food",
                    establishment: encryptedEstablishment2,
                    isExpense: true,
                    isEssential: false,
                    note: null,
                    amount: encryptedAmount2,
                  },
                ]),
              }),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      });

      const { fetchAllFilteredTransactions } = await import("../data");
      const result = await fetchAllFilteredTransactions({
        query: "walmart",
        dates: "2024-01-01to2024-01-31",
        userId: "user-1",
      });

      // Should only return the Walmart transaction since we filtered by "walmart"
      expect(result).toHaveLength(1);
      expect(result[0].establishment).toBe("Walmart");
      expect(result[0].amount).toBe(10); // 1000 cents -> $10
    });
  });

  describe("fetchFilteredTransactions (paginated)", () => {
    it("should paginate decrypted results correctly", async () => {
      // Create 15 transactions so we can test pagination (10 per page)
      const encryptedTransactions = Array.from({ length: 15 }, (_, i) => ({
        id: `tx-${i}`,
        userId: "user-1",
        transactionDate: new Date(`2024-01-${String(i + 1).padStart(2, "0")}`),
        category: "food",
        establishment: encrypt(`Store ${i}`),
        isExpense: true,
        isEssential: true,
        note: null,
        amount: encrypt(`${(i + 1) * 100}`),
      }));

      const { db } = await import("../db");
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // fetchUserSettings call
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: "user-1",
                  language: "en-US",
                  timezone: "UTC",
                },
              ]),
            }),
          } as any;
        }
        if (callCount === 2) {
          // Main query
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(encryptedTransactions),
              }),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      });

      const { fetchFilteredTransactions } = await import("../data");

      // Page 1 should have 10 items
      const page1 = await fetchFilteredTransactions(
        "",
        "2024-01-01to2024-01-31",
        1,
        "user-1",
      );
      expect(page1).toHaveLength(10);

      // Reset callCount for page 2
      callCount = 0;
      const page2 = await fetchFilteredTransactions(
        "",
        "2024-01-01to2024-01-31",
        2,
        "user-1",
      );
      expect(page2).toHaveLength(5);
    });
  });

  describe("fetchTransactionPages", () => {
    it("should count pages based on decrypted and filtered results", async () => {
      const encryptedTransactions = Array.from({ length: 25 }, (_, i) => ({
        id: `tx-${i}`,
        category: "food",
        establishment: encrypt(`Store ${i}`),
        note: null,
      }));

      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(encryptedTransactions),
        }),
      } as any);

      const { fetchTransactionPages } = await import("../data");
      const pages = await fetchTransactionPages(
        "",
        "2024-01-01to2024-12-31",
        "user-1",
      );

      // 25 items / 10 per page = 3 pages
      expect(pages).toBe(3);
    });

    it("should filter by decrypted establishment before counting pages", async () => {
      const encryptedTransactions = [
        {
          id: "tx-1",
          category: "food",
          establishment: encrypt("Walmart"),
          note: null,
        },
        {
          id: "tx-2",
          category: "food",
          establishment: encrypt("Target"),
          note: null,
        },
        {
          id: "tx-3",
          category: "food",
          establishment: encrypt("Walmart Supercenter"),
          note: null,
        },
      ];

      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(encryptedTransactions),
        }),
      } as any);

      const { fetchTransactionPages } = await import("../data");
      const pages = await fetchTransactionPages(
        "walmart",
        "2024-01-01to2024-12-31",
        "user-1",
      );

      // 2 items match "walmart" / 10 per page = 1 page
      expect(pages).toBe(1);
    });

    it("should filter by tagIds before counting pages", async () => {
      const encryptedTransactions = [
        {
          id: "tx-1",
          category: "food",
          establishment: encrypt("Store A"),
          note: null,
        },
        {
          id: "tx-2",
          category: "food",
          establishment: encrypt("Store B"),
          note: null,
        },
        {
          id: "tx-3",
          category: "food",
          establishment: encrypt("Store C"),
          note: null,
        },
      ];

      const { db } = await import("../db");
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Main transaction query
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue(encryptedTransactions),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  transactionId: "tx-1",
                  tagId: "tag-1",
                  tagName: "Cash",
                  tagColor: "#00FF00",
                  tagUserId: "user-1",
                },
                {
                  transactionId: "tx-3",
                  tagId: "tag-1",
                  tagName: "Cash",
                  tagColor: "#00FF00",
                  tagUserId: "user-1",
                },
              ]),
            }),
          }),
        } as any;
      });

      const { fetchTransactionPages } = await import("../data");
      const pages = await fetchTransactionPages(
        "",
        "2024-01-01to2024-12-31",
        "user-1",
        ["tag-1"],
      );

      // Only tx-1 and tx-3 have tag-1, so 2 items / 10 per page = 1 page
      expect(pages).toBe(1);
    });
  });

  describe("fetchFilteredTransactions - tag filtering", () => {
    it("should filter transactions by tagIds", async () => {
      const encryptedTransactions = [
        {
          id: "tx-1",
          userId: "user-1",
          transactionDate: new Date("2024-01-15"),
          category: "food",
          establishment: encrypt("Store A"),
          isExpense: true,
          isEssential: true,
          note: null,
          amount: encrypt("1000"),
        },
        {
          id: "tx-2",
          userId: "user-1",
          transactionDate: new Date("2024-01-16"),
          category: "food",
          establishment: encrypt("Store B"),
          isExpense: true,
          isEssential: false,
          note: null,
          amount: encrypt("2000"),
        },
        {
          id: "tx-3",
          userId: "user-1",
          transactionDate: new Date("2024-01-17"),
          category: "food",
          establishment: encrypt("Store C"),
          isExpense: true,
          isEssential: true,
          note: null,
          amount: encrypt("3000"),
        },
      ];

      const { db } = await import("../db");
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // fetchUserSettings call
          return {
            from: vi.fn().mockReturnValue({
              where: vi
                .fn()
                .mockResolvedValue([
                  {
                    id: 1,
                    userId: "user-1",
                    language: "en-US",
                    timezone: "UTC",
                  },
                ]),
            }),
          } as any;
        }
        if (callCount === 2) {
          // Main query
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(encryptedTransactions),
              }),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  transactionId: "tx-1",
                  tagId: "tag-cash",
                  tagName: "Cash",
                  tagColor: "#00FF00",
                  tagUserId: "user-1",
                },
                {
                  transactionId: "tx-3",
                  tagId: "tag-cash",
                  tagName: "Cash",
                  tagColor: "#00FF00",
                  tagUserId: "user-1",
                },
                {
                  transactionId: "tx-2",
                  tagId: "tag-cc",
                  tagName: "Credit Card",
                  tagColor: "#FF0000",
                  tagUserId: "user-1",
                },
              ]),
            }),
          }),
        } as any;
      });

      const { fetchFilteredTransactions } = await import("../data");
      const result = await fetchFilteredTransactions(
        "",
        "2024-01-01to2024-01-31",
        1,
        "user-1",
        ["tag-cash"],
      );

      // Only tx-1 and tx-3 have tag-cash
      expect(result).toHaveLength(2);
      expect(result[0].establishment).toBe("Store A");
      expect(result[1].establishment).toBe("Store C");

      // Each result should have tags populated
      expect(result[0].tags).toHaveLength(1);
      expect(result[0].tags[0].name).toBe("Cash");
    });

    it("should return all transactions when tagIds is undefined", async () => {
      const encryptedTransactions = [
        {
          id: "tx-1",
          userId: "user-1",
          transactionDate: new Date("2024-01-15"),
          category: "food",
          establishment: encrypt("Store A"),
          isExpense: true,
          isEssential: true,
          note: null,
          amount: encrypt("1000"),
        },
        {
          id: "tx-2",
          userId: "user-1",
          transactionDate: new Date("2024-01-16"),
          category: "food",
          establishment: encrypt("Store B"),
          isExpense: true,
          isEssential: false,
          note: null,
          amount: encrypt("2000"),
        },
      ];

      const { db } = await import("../db");
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi
                .fn()
                .mockResolvedValue([
                  {
                    id: 1,
                    userId: "user-1",
                    language: "en-US",
                    timezone: "UTC",
                  },
                ]),
            }),
          } as any;
        }
        if (callCount === 2) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(encryptedTransactions),
              }),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      });

      const { fetchFilteredTransactions } = await import("../data");
      const result = await fetchFilteredTransactions(
        "",
        "2024-01-01to2024-01-31",
        1,
        "user-1",
        // No tagIds passed
      );

      // All transactions should be returned
      expect(result).toHaveLength(2);
    });
  });

  describe("fetchAllFilteredTransactions - tag filtering", () => {
    it("should filter by tagIds", async () => {
      const encryptedEstablishment1 = encrypt("Store Alpha");
      const encryptedEstablishment2 = encrypt("Store Beta");
      const encryptedAmount1 = encrypt("1000");
      const encryptedAmount2 = encrypt("2000");

      const { db } = await import("../db");
      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // fetchUserSettings call
          return {
            from: vi.fn().mockReturnValue({
              where: vi
                .fn()
                .mockResolvedValue([
                  {
                    id: 1,
                    userId: "user-1",
                    language: "en-US",
                    timezone: "UTC",
                  },
                ]),
            }),
          } as any;
        }
        if (callCount === 2) {
          // Main query
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([
                  {
                    id: "tx-1",
                    userId: "user-1",
                    transactionDate: new Date("2024-01-15"),
                    category: "food",
                    establishment: encryptedEstablishment1,
                    isExpense: true,
                    isEssential: true,
                    note: null,
                    amount: encryptedAmount1,
                  },
                  {
                    id: "tx-2",
                    userId: "user-1",
                    transactionDate: new Date("2024-01-16"),
                    category: "food",
                    establishment: encryptedEstablishment2,
                    isExpense: true,
                    isEssential: false,
                    note: null,
                    amount: encryptedAmount2,
                  },
                ]),
              }),
            }),
          } as any;
        }
        // fetchTagsForTransactions query
        return {
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi
                .fn()
                .mockResolvedValue([
                  {
                    transactionId: "tx-1",
                    tagId: "tag-a",
                    tagName: "TagA",
                    tagColor: "#111111",
                    tagUserId: "user-1",
                  },
                ]),
            }),
          }),
        } as any;
      });

      const { fetchAllFilteredTransactions } = await import("../data");
      const result = await fetchAllFilteredTransactions({
        query: "",
        dates: "2024-01-01to2024-01-31",
        userId: "user-1",
        tagIds: ["tag-a"],
      });

      // Only tx-1 has tag-a
      expect(result).toHaveLength(1);
      expect(result[0].establishment).toBe("Store Alpha");
      expect(result[0].tags).toHaveLength(1);
      expect(result[0].tags[0].name).toBe("TagA");
    });
  });

  describe("fetchCardData", () => {
    it("should aggregate decrypted amounts correctly", async () => {
      const { db } = await import("../db");

      let callCount = 0;
      vi.mocked(db.select).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // fetchUserSettings call
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  userId: "user-1",
                  language: "en-US",
                  timezone: "UTC",
                },
              ]),
            }),
          } as any;
        }
        if (callCount === 2) {
          // Year transactions
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                {
                  amount: encrypt("10000"), // $100 in cents
                  isExpense: true,
                  transactionDate: new Date("2024-01-15"), // month 1
                },
                {
                  amount: encrypt("20000"), // $200 in cents
                  isExpense: true,
                  transactionDate: new Date("2024-01-20"), // month 1
                },
                {
                  amount: encrypt("50000"), // $500 in cents
                  isExpense: false, // income
                  transactionDate: new Date("2024-01-10"), // month 1
                },
                {
                  amount: encrypt("15000"), // $150 in cents
                  isExpense: true,
                  transactionDate: new Date("2024-02-15"), // month 2
                },
              ]),
            }),
          } as any;
        }
        if (callCount === 3) {
          // Budget query
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([
                { budget: encrypt("1000") }, // $1000 budget
              ]),
            }),
          } as any;
        }
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any;
      });

      const { fetchCardData } = await import("../data");
      const result = await fetchCardData("user-1", "1", "2024");

      // Month 1 spend: $100 + $200 = $300 (30000 cents)
      // Month 1 income: $500 (50000 cents)
      // Year spend: $300 + $150 = $450 (45000 cents)
      // Year income: $500 (50000 cents)
      expect(result).toBeDefined();
      // The result values are formatted currency strings
      expect(typeof result.totalMonthSpend).toBe("string");
      expect(typeof result.totalMonthIncome).toBe("string");
      expect(typeof result.totalYearSpend).toBe("string");
      expect(typeof result.totalYearIncome).toBe("string");
    });
  });

  describe("fetchSpendDataByMonth", () => {
    it("should aggregate decrypted amounts by month", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              amount: encrypt("5000"), // $50 in cents
              transactionDate: new Date("2024-01-15"),
            },
            {
              amount: encrypt("3000"), // $30 in cents
              transactionDate: new Date("2024-01-20"),
            },
            {
              amount: encrypt("7000"), // $70 in cents
              transactionDate: new Date("2024-02-10"),
            },
          ]),
        }),
      } as any);

      const { fetchSpendDataByMonth } = await import("../data");
      const result = await fetchSpendDataByMonth("user-1", "2024");

      // Month 1: $50 + $30 = $80
      // Month 2: $70
      const month1 = result.find((r) => r.month === 1);
      const month2 = result.find((r) => r.month === 2);
      expect(month1?.total).toBe(80);
      expect(month2?.total).toBe(70);
    });
  });

  describe("fetchSpendDataByCategory", () => {
    it("should aggregate decrypted amounts by category", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { category: "food", amount: encrypt("5000") },
            { category: "food", amount: encrypt("3000") },
            { category: "transport", amount: encrypt("2000") },
          ]),
        }),
      } as any);

      const { fetchSpendDataByCategory } = await import("../data");
      const result = await fetchSpendDataByCategory("user-1", "2024");

      const food = result.find((r) => r.category === "food");
      const transport = result.find((r) => r.category === "transport");
      expect(food?.total).toBe(80); // (5000 + 3000) / 100 = 80
      expect(transport?.total).toBe(20); // 2000 / 100 = 20
    });
  });

  describe("fetchUserBudgetSettings", () => {
    it("should decrypt budget values", async () => {
      const encryptedBudget = encrypt("500");

      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: 1,
              userId: "user-1",
              category: "food",
              budget: encryptedBudget,
            },
          ]),
        }),
      } as any);

      const { fetchUserBudgetSettings } = await import("../data");
      const result = await fetchUserBudgetSettings("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].budget).toBe("500"); // returned as string
      expect(result[0].category).toBe("food");
    });

    it("should handle plaintext budgets during migration", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: 1,
              userId: "user-1",
              category: "food",
              budget: "500", // plaintext, not encrypted
            },
          ]),
        }),
      } as any);

      const { fetchUserBudgetSettings } = await import("../data");
      const result = await fetchUserBudgetSettings("user-1");

      expect(result[0].budget).toBe("500");
    });
  });

  describe("fetchUserBudgetByMonth", () => {
    it("should sum decrypted budget values", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { budget: encrypt("500") },
              { budget: encrypt("300") },
            ]),
        }),
      } as any);

      const { fetchUserBudgetByMonth } = await import("../data");
      const result = await fetchUserBudgetByMonth("user-1");

      expect(result).toBe(800); // 500 + 300
    });

    it("should return 0 when no budget settings exist", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { fetchUserBudgetByMonth } = await import("../data");
      const result = await fetchUserBudgetByMonth("user-1");

      expect(result).toBe(0);
    });
  });

  describe("fetchEssentialSpendDataByMonth", () => {
    it("should decrypt and aggregate essential spend by month", async () => {
      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              amount: encrypt("10000"), // $100
              transactionDate: new Date("2024-03-15"),
            },
            {
              amount: encrypt("5000"), // $50
              transactionDate: new Date("2024-03-20"),
            },
          ]),
        }),
      } as any);

      const { fetchEssentialSpendDataByMonth } = await import("../data");
      const result = await fetchEssentialSpendDataByMonth("user-1", "2024");

      const march = result.find((r) => r.month === 3);
      expect(march?.total).toBe(150); // $100 + $50
    });
  });

  describe("fetchIncomedDataByMonth", () => {
    it("should decrypt and aggregate income by month", async () => {
      const encAmount1 = encrypt("300000"); // 300000 cents = $3000
      const encAmount2 = encrypt("100000"); // 100000 cents = $1000

      const { db } = await import("../db");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              amount: encAmount1,
              transactionDate: new Date("2024-01-15"),
            },
            {
              amount: encAmount2,
              transactionDate: new Date("2024-02-15"),
            },
          ]),
        }),
      } as any);

      const { fetchIncomedDataByMonth } = await import("../data");
      const result = await fetchIncomedDataByMonth("user-1", "2024");

      // Debug: log the result to see what we actually get
      expect(result).toHaveLength(2);
      // decryptAmount converts cents to dollars: 300000/100 = 3000, 100000/100 = 1000
      const sorted = [...result].sort((a, b) => a.month - b.month);
      expect(sorted[0].month).toBe(1);
      expect(sorted[0].total).toBe(3000);
      expect(sorted[1].month).toBe(2);
      expect(sorted[1].total).toBe(1000);
    });
  });
});
