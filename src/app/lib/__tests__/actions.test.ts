import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decrypt } from "../crypto";

// A valid 32-byte key encoded in base64 for testing
const TEST_KEY = "RpjGstp2ozdRkHBcCrJz0BOYv+UH4eIU7dvVFMQQgow=";

// Track what values are inserted/updated in the DB
let insertedValues: any = null;
let updatedValues: any = null;

// Mock the db module with spies to capture inserted/updated values
vi.mock("../db", () => {
  const mockWhere = vi.fn().mockResolvedValue(undefined);
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
  const mockValues = vi.fn().mockResolvedValue(undefined);
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });
  const mockDelete = vi
    .fn()
    .mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([]),
            }),
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    },
  };
});

// Mock next-intl
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/navigation - redirect throws a special error in Next.js
const REDIRECT_ERROR = "NEXT_REDIRECT";
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    const error = new Error(REDIRECT_ERROR);
    (error as any).digest = REDIRECT_ERROR;
    throw error;
  }),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: vi.fn(),
      get: vi.fn(),
    }),
  ),
}));

// Mock data module (fetchUserSettings is called in actions)
vi.mock("../data", () => ({
  fetchUserSettings: vi.fn(() =>
    Promise.resolve([
      { id: 1, userId: "user-1", language: "en-US", timezone: "UTC" },
    ]),
  ),
}));

// Mock categories helpers
vi.mock("../helpers/categories", () => ({
  getAllCategoriesMap: vi.fn(() => ({
    food: "Food",
    transport: "Transport",
  })),
  getTranslatedAllCategoriesMap: vi.fn(() =>
    Promise.resolve({
      food: "Food",
      transport: "Transport",
    }),
  ),
}));

describe("actions.ts - encryption on write", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
    insertedValues = null;
    updatedValues = null;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("should encrypt amount and establishment before inserting", async () => {
      const { db } = await import("../db");

      // Set up insert spy to capture the values
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      // Mock fetchUserSettings call (via db.select)
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { id: 1, userId: "user-1", language: "en-US", timezone: "UTC" },
            ]),
        }),
      } as any);

      const formData = new FormData();
      formData.set("isExpense", "true");
      formData.set("amount", "50.00");
      formData.set("note", "lunch");
      formData.set("establishment", "Restaurant ABC");
      formData.set("category", "food");
      formData.set("isEssential", "true");
      formData.set("userId", "user-1");
      formData.set("transactionDate", "01/15/2024");

      const { createTransaction } = await import("../actions");

      try {
        await createTransaction({}, formData);
      } catch (e: any) {
        // redirect throws; ignore it
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      // Verify insert was called
      expect(db.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();

      const insertedData = mockValues.mock.calls[0][0];

      // Amount should be encrypted (5000 cents)
      expect(insertedData.amount).toBeDefined();
      expect(insertedData.amount).not.toBe("5000");
      expect(insertedData.amount).not.toBe(5000);
      // Verify it's actually encrypted by decrypting it
      const decryptedAmount = decrypt(insertedData.amount);
      expect(decryptedAmount).toBe("5000");

      // Establishment should be encrypted
      expect(insertedData.establishment).toBeDefined();
      expect(insertedData.establishment).not.toBe("Restaurant ABC");
      const decryptedEstablishment = decrypt(insertedData.establishment);
      expect(decryptedEstablishment).toBe("Restaurant ABC");

      // Note should NOT be encrypted
      expect(insertedData.note).toBe("lunch");

      // Category should NOT be encrypted
      expect(insertedData.category).toBe("food");
    });

    it("should correctly convert amount to cents before encrypting", async () => {
      const { db } = await import("../db");

      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { id: 1, userId: "user-1", language: "en-US", timezone: "UTC" },
            ]),
        }),
      } as any);

      const formData = new FormData();
      formData.set("isExpense", "true");
      formData.set("amount", "123.45");
      formData.set("note", "");
      formData.set("establishment", "Shop");
      formData.set("category", "food");
      formData.set("isEssential", "false");
      formData.set("userId", "user-1");
      formData.set("transactionDate", "01/15/2024");

      const { createTransaction } = await import("../actions");

      try {
        await createTransaction({}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      const insertedData = mockValues.mock.calls[0][0];
      const decryptedAmount = decrypt(insertedData.amount);
      // 123.45 * 100 = 12345 cents
      expect(decryptedAmount).toBe("12345");
    });

    it("should return validation errors without encrypting when form is invalid", async () => {
      const formData = new FormData();
      formData.set("isExpense", "true");
      formData.set("amount", "0"); // invalid: must be > 0
      formData.set("note", "");
      formData.set("establishment", ""); // invalid: must be non-empty
      formData.set("category", "food");
      formData.set("isEssential", "false");
      formData.set("userId", "user-1");
      formData.set("transactionDate", "01/15/2024");

      const { createTransaction } = await import("../actions");
      const result = await createTransaction({}, formData);

      expect(result.errors).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });

  describe("updateTransaction", () => {
    it("should encrypt amount and establishment when updating", async () => {
      const { db } = await import("../db");

      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      // fetchUserSettings is mocked at the module level (returns settings directly)
      // So the only db.select call is for the existing transaction: db.select().from().where().limit(1)
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "tx-1",
                transactionDate: new Date("2024-01-15T12:00:00Z"),
              },
            ]),
          }),
        }),
      } as any);

      const formData = new FormData();
      formData.set("isExpense", "true");
      formData.set("amount", "75.50");
      formData.set("note", "updated note");
      formData.set("establishment", "Updated Store");
      formData.set("category", "transport");
      formData.set("isEssential", "true");
      formData.set("userId", "user-1");
      formData.set("transactionDate", "01/15/2024");

      const { updateTransaction } = await import("../actions");

      let result: any;
      try {
        result = await updateTransaction("tx-1", {}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      // If we got a result (not a redirect), it might be an error state
      if (result && result.message) {
        // Unexpected error - fail with details
        expect(result.message).toBeUndefined();
      }

      expect(mockSet).toHaveBeenCalled();
      const setData = mockSet.mock.calls[0][0];

      // Amount should be encrypted (7550 cents)
      const decryptedAmount = decrypt(setData.amount);
      expect(decryptedAmount).toBe("7550");

      // Establishment should be encrypted
      const decryptedEstablishment = decrypt(setData.establishment);
      expect(decryptedEstablishment).toBe("Updated Store");

      // Note should NOT be encrypted
      expect(setData.note).toBe("updated note");
    });
  });

  describe("createTransaction - tags", () => {
    it("should save tags to junction table after inserting transaction", async () => {
      const { db } = await import("../db");

      // Mock insert: first call for transaction (returns id), second for transactionTags
      const mockReturning = vi.fn().mockResolvedValue([{ id: "new-tx-1" }]);
      const mockTransactionValues = vi
        .fn()
        .mockReturnValue({ returning: mockReturning });
      const mockTagValues = vi.fn().mockResolvedValue(undefined);

      let insertCallCount = 0;
      vi.mocked(db.insert).mockImplementation(() => {
        insertCallCount++;
        if (insertCallCount === 1) {
          // transactions insert
          return { values: mockTransactionValues } as any;
        }
        // transactionTags insert
        return { values: mockTagValues } as any;
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { id: 1, userId: "user-1", language: "en-US", timezone: "UTC" },
            ]),
        }),
      } as any);

      const formData = new FormData();
      formData.set("isExpense", "true");
      formData.set("amount", "25.00");
      formData.set("note", "tagged purchase");
      formData.set("establishment", "Store");
      formData.set("category", "food");
      formData.set("isEssential", "false");
      formData.set("userId", "user-1");
      formData.set("transactionDate", "01/15/2024");
      formData.append("tags", "tag-id-1");
      formData.append("tags", "tag-id-2");

      const { createTransaction } = await import("../actions");

      try {
        await createTransaction({}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      // Should have called insert twice: once for transaction, once for tags
      expect(db.insert).toHaveBeenCalledTimes(2);

      // Verify tag junction rows
      expect(mockTagValues).toHaveBeenCalledWith([
        { transactionId: "new-tx-1", tagId: "tag-id-1" },
        { transactionId: "new-tx-1", tagId: "tag-id-2" },
      ]);
    });

    it("should not insert tags when none are provided", async () => {
      const { db } = await import("../db");

      const mockReturning = vi.fn().mockResolvedValue([{ id: "new-tx-2" }]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi
            .fn()
            .mockResolvedValue([
              { id: 1, userId: "user-1", language: "en-US", timezone: "UTC" },
            ]),
        }),
      } as any);

      const formData = new FormData();
      formData.set("isExpense", "true");
      formData.set("amount", "10.00");
      formData.set("note", "");
      formData.set("establishment", "Shop");
      formData.set("category", "food");
      formData.set("isEssential", "false");
      formData.set("userId", "user-1");
      formData.set("transactionDate", "01/15/2024");
      // No tags appended

      const { createTransaction } = await import("../actions");

      try {
        await createTransaction({}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      // Should only have called insert once (for transaction, not for tags)
      expect(db.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateTransaction - tags", () => {
    it("should delete existing tags and re-insert new ones", async () => {
      const { db } = await import("../db");

      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      // Mock delete for transactionTags
      const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({
        where: mockDeleteWhere,
      } as any);

      // Mock insert for transactionTags
      const mockTagValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockTagValues,
      } as any);

      // db.select: first call for fetchUserSettings (via data mock),
      // second call for existing transaction lookup
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([
              {
                id: "tx-1",
                transactionDate: new Date("2024-01-15T12:00:00Z"),
              },
            ]),
          }),
        }),
      } as any);

      const formData = new FormData();
      formData.set("isExpense", "true");
      formData.set("amount", "50.00");
      formData.set("note", "updated");
      formData.set("establishment", "Updated Store");
      formData.set("category", "food");
      formData.set("isEssential", "true");
      formData.set("userId", "user-1");
      formData.set("transactionDate", "01/15/2024");
      formData.append("tags", "tag-new-1");
      formData.append("tags", "tag-new-2");

      const { updateTransaction } = await import("../actions");

      try {
        await updateTransaction("tx-1", {}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      // Should have called delete for transactionTags
      expect(db.delete).toHaveBeenCalled();
      expect(mockDeleteWhere).toHaveBeenCalled();

      // Should have called insert for new tags
      expect(db.insert).toHaveBeenCalled();
      expect(mockTagValues).toHaveBeenCalledWith([
        { transactionId: "tx-1", tagId: "tag-new-1" },
        { transactionId: "tx-1", tagId: "tag-new-2" },
      ]);
    });
  });

  describe("createTag", () => {
    it("should insert a new tag with valid data", async () => {
      const { db } = await import("../db");

      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const formData = new FormData();
      formData.set("name", "Credit Card");
      formData.set("color", "#FF5733");
      formData.set("userId", "user-1");

      const { createTag } = await import("../actions");

      try {
        await createTag({}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      expect(db.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith({
        name: "Credit Card",
        color: "#FF5733",
        userId: "user-1",
      });
    });

    it("should return validation errors when name is empty", async () => {
      const formData = new FormData();
      formData.set("name", "");
      formData.set("color", "#FF5733");
      formData.set("userId", "user-1");

      const { createTag } = await import("../actions");
      const result = await createTag({}, formData);

      expect(result.errors).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it("should return validation errors when color is invalid", async () => {
      const formData = new FormData();
      formData.set("name", "Cash");
      formData.set("color", "not-a-color");
      formData.set("userId", "user-1");

      const { createTag } = await import("../actions");
      const result = await createTag({}, formData);

      expect(result.errors).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it("should return database error when insert fails", async () => {
      const { db } = await import("../db");

      const mockValues = vi.fn().mockRejectedValue(new Error("DB error"));
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const formData = new FormData();
      formData.set("name", "Cash");
      formData.set("color", "#00FF00");
      formData.set("userId", "user-1");

      const { createTag } = await import("../actions");
      const result = await createTag({}, formData);

      expect(result.message).toBeDefined();
    });
  });

  describe("updateTag", () => {
    it("should update an existing tag", async () => {
      const { db } = await import("../db");

      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const formData = new FormData();
      formData.set("name", "Debit Card");
      formData.set("color", "#0000FF");
      formData.set("userId", "user-1");

      const { updateTag } = await import("../actions");

      try {
        await updateTag("tag-1", {}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      expect(mockSet).toHaveBeenCalledWith({
        name: "Debit Card",
        color: "#0000FF",
      });
    });

    it("should return validation errors for invalid color", async () => {
      const formData = new FormData();
      formData.set("name", "Cash");
      formData.set("color", "blue");
      formData.set("userId", "user-1");

      const { updateTag } = await import("../actions");
      const result = await updateTag("tag-1", {}, formData);

      expect(result.errors).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it("should return database error when update fails", async () => {
      const { db } = await import("../db");

      const mockWhere = vi.fn().mockRejectedValue(new Error("DB error"));
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const formData = new FormData();
      formData.set("name", "Cash");
      formData.set("color", "#FF0000");
      formData.set("userId", "user-1");

      const { updateTag } = await import("../actions");
      const result = await updateTag("tag-1", {}, formData);

      expect(result.message).toBeDefined();
    });
  });

  describe("deleteTag", () => {
    it("should delete a tag by id", async () => {
      const { db } = await import("../db");

      const mockWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

      const { deleteTag } = await import("../actions");
      const result = await deleteTag("tag-1");

      expect(db.delete).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(result.message).toBeDefined();
    });

    it("should return error when delete fails", async () => {
      const { db } = await import("../db");

      const mockWhere = vi.fn().mockRejectedValue(new Error("DB error"));
      vi.mocked(db.delete).mockReturnValue({ where: mockWhere } as any);

      const { deleteTag } = await import("../actions");
      const result = await deleteTag("tag-1");

      expect(result.message).toBeDefined();
    });
  });

  describe("saveBudgetSettings", () => {
    it("should encrypt budget values before saving", async () => {
      const { db } = await import("../db");

      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      // Mock the existing setting check (returns empty -> will insert)
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      const formData = new FormData();
      formData.set("userId", "user-1");
      formData.set("budget-food", "500");
      formData.set("budget-transport", "200");

      const { saveBudgetSettings } = await import("../actions");

      try {
        await saveBudgetSettings({}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      // Should have called insert twice (one for each budget category)
      expect(db.insert).toHaveBeenCalledTimes(2);

      // Verify first budget is encrypted
      const firstInsert = mockValues.mock.calls[0][0];
      const decryptedBudget1 = decrypt(firstInsert.budget);
      expect(decryptedBudget1).toBe("500");
      expect(firstInsert.category).toBe("food");

      // Verify second budget is encrypted
      const secondInsert = mockValues.mock.calls[1][0];
      const decryptedBudget2 = decrypt(secondInsert.budget);
      expect(decryptedBudget2).toBe("200");
      expect(secondInsert.category).toBe("transport");
    });

    it("should encrypt budget when updating existing setting", async () => {
      const { db } = await import("../db");

      // Mock existing setting check -> returns an existing record
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              execute: vi
                .fn()
                .mockResolvedValue([
                  { id: 1, userId: "user-1", category: "food", budget: "old" },
                ]),
            }),
          }),
        }),
      } as any);

      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const formData = new FormData();
      formData.set("userId", "user-1");
      formData.set("budget-food", "750");

      const { saveBudgetSettings } = await import("../actions");

      try {
        await saveBudgetSettings({}, formData);
      } catch (e: any) {
        if (e.message !== REDIRECT_ERROR) throw e;
      }

      expect(mockSet).toHaveBeenCalled();
      const setData = mockSet.mock.calls[0][0];
      const decryptedBudget = decrypt(setData.budget);
      expect(decryptedBudget).toBe("750");
    });
  });
});
