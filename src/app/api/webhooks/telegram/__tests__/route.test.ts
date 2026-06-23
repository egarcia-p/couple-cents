import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "../route";
import { decrypt } from "@/app/lib/crypto";

// A valid 32-byte key encoded in base64 for testing
const TEST_KEY = "RpjGstp2ozdRkHBcCrJz0BOYv+UH4eIU7dvVFMQQgow=";

// Mock the db module
vi.mock("@/app/lib/db", () => {
  const mockValues = vi.fn().mockResolvedValue(undefined);
  const mockInsert = vi.fn().mockReturnValue({ values: mockValues });
  return {
    db: {
      insert: mockInsert,
    },
  };
});

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Telegram Webhook Route", () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "mock_bot_token");
    vi.stubEnv("TELEGRAM_USER_MAPPINGS", "12345:user_123,67890:user_456");

    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("OK"),
    });
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe("GET /api/webhooks/telegram", () => {
    it("should return running status", async () => {
      const response = await GET();
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toEqual({ status: "running" });
    });
  });

  describe("POST /api/webhooks/telegram", () => {
    it("should return 400 for invalid payload", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Invalid payload");
    });

    it("should return unauthorized reply when Chat ID is not mapped", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 99999 },
            text: "/spend 10.00 GRO Walmart",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Unauthorized chat ID");

      // Verify telegram message was sent
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchArgs = mockFetch.mock.calls[0];
      expect(fetchArgs[0]).toBe("https://api.telegram.org/botmock_bot_token/sendMessage");
      const postBody = JSON.parse(fetchArgs[1].body);
      expect(postBody.chat_id).toBe("99999");
      expect(postBody.text).toContain("Unauthorized Account");
    });

    it("should return missing text error reply for non-text messages", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            // no text field (e.g. photo payload)
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Missing message text");

      expect(mockFetch).toHaveBeenCalled();
      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.text).toContain("Unsupported message type");
    });

    it("should return help message for non-spend commands", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "Hello",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Help message sent");

      expect(mockFetch).toHaveBeenCalled();
      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.text).toContain("Welcome to couple-cents!");
      expect(postBody.text).toContain("/categories");
    });

    it("should return category list for /categories command", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/categories",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Categories list sent");

      expect(mockFetch).toHaveBeenCalled();
      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.text).toContain("Available Categories");
      expect(postBody.text).toContain("GRO");
      expect(postBody.text).toContain("Groceries");
      expect(postBody.text).toContain("DIN");
      expect(postBody.text).toContain("Dining Out");
    });

    it("should return category list for /categorias command (Spanish alias)", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/categorias",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Categories list sent");
    });

    it("should return format error reply for malformed spend commands", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 10.00 GRO", // missing establishment
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Invalid command format");

      expect(mockFetch).toHaveBeenCalled();
      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.text).toContain("Invalid Command Format");
    });

    it("should return invalid category error reply for unknown categories", async () => {
      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 10.00 invalidCategory Target",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Invalid category");

      expect(mockFetch).toHaveBeenCalled();
      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.text).toContain("Invalid Category");
      expect(postBody.text).toContain("GRO"); // lists valid categories
    });

    it("should successfully log transaction and confirm", async () => {
      const { db } = await import("@/app/lib/db");
      const { revalidatePath } = await import("next/cache");

      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 14.50 GRO Walmart weekly groceries",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Transaction logged");

      // Verify db insertion
      expect(db.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();
      const insertedData = mockValues.mock.calls[0][0];

      // Verify encryption
      expect(decrypt(insertedData.amount)).toBe("1450");
      expect(decrypt(insertedData.establishment)).toBe("Walmart");
      expect(insertedData.category).toBe("GRO");
      expect(insertedData.note).toBe("weekly groceries");
      expect(insertedData.userId).toBe("user_123");
      expect(insertedData.isExpense).toBe(true);
      expect(insertedData.isEssential).toBe(false);

      // Verify revalidation
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/transactions");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");

      // Verify Telegram confirmation
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.chat_id).toBe("12345");
      expect(postBody.text).toContain("Transaction Logged!");
      expect(postBody.text).toContain("$14.50");
      expect(postBody.text).toContain("Groceries (GRO)");
      expect(postBody.text).toContain("Walmart");
      expect(postBody.text).toContain("weekly groceries");
      expect(postBody.text).toContain("Non-essential");
    });

    it("should also support /gasto and category name mapping", async () => {
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 67890 },
            text: "/gasto 250 groceries Vips",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const insertedData = mockValues.mock.calls[0][0];
      expect(decrypt(insertedData.amount)).toBe("25000");
      expect(decrypt(insertedData.establishment)).toBe("Vips");
      expect(insertedData.category).toBe("GRO");
      expect(insertedData.note).toBeNull();
      expect(insertedData.userId).toBe("user_456");
    });

    it("should mark transaction as essential when 'essential' keyword is used", async () => {
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 14.50 HOU Electricity essential",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const insertedData = mockValues.mock.calls[0][0];
      expect(insertedData.isEssential).toBe(true);
      expect(insertedData.note).toBeNull();

      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.text).toContain("Essential");
    });

    it("should mark essential and preserve the note after the keyword", async () => {
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: '/spend 18.50 DIN "Burger King" essential team lunch',
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const insertedData = mockValues.mock.calls[0][0];
      expect(insertedData.isEssential).toBe(true);
      expect(insertedData.note).toBe("team lunch");
      expect(decrypt(insertedData.establishment)).toBe("Burger King");
    });

    it("should support Spanish 'esencial' keyword for essential flag", async () => {
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/gasto 250 GRO Walmart esencial compra semanal",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const insertedData = mockValues.mock.calls[0][0];
      expect(insertedData.isEssential).toBe(true);
      expect(insertedData.note).toBe("compra semanal");
    });

    it("should default to non-essential when keyword is absent", async () => {
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 14.50 GRO Walmart weekly run",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();
      expect(response.status).toBe(200);

      const insertedData = mockValues.mock.calls[0][0];
      expect(insertedData.isEssential).toBe(false);
      expect(insertedData.note).toBe("weekly run");
    });

    it("should support quoted multi-word establishment names", async () => {
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: '/spend 18.50 DIN "Burger King" lunch with team',
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const insertedData = mockValues.mock.calls[0][0];
      expect(decrypt(insertedData.amount)).toBe("1850");
      expect(decrypt(insertedData.establishment)).toBe("Burger King");
      expect(insertedData.category).toBe("DIN");
      expect(insertedData.note).toBe("lunch with team");
    });

    it("should support quoted establishment without a note", async () => {
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: '/spend 250 GRO "Costco Mexico"',
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);

      const insertedData = mockValues.mock.calls[0][0];
      expect(decrypt(insertedData.amount)).toBe("25000");
      expect(decrypt(insertedData.establishment)).toBe("Costco Mexico");
      expect(insertedData.category).toBe("GRO");
      expect(insertedData.note).toBeNull();
    });

    it("should handle system error gracefully when DB insert fails", async () => {
      const { db } = await import("@/app/lib/db");
      vi.mocked(db.insert).mockImplementation(() => {
        throw new Error("DB Error");
      });

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 14.50 GRO Walmart",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Internal server error");

      expect(mockFetch).toHaveBeenCalled();
      const postBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(postBody.text).toContain("System Error");
    });

    it("should return 403 when TELEGRAM_WEBHOOK_SECRET is set but header is missing or mismatch", async () => {
      vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", "super_secret");

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        headers: {
          // missing or wrong secret header
          "X-Telegram-Bot-Api-Secret-Token": "wrong_secret",
        },
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 14.50 GRO Walmart",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Unauthorized origin");
    });

    it("should succeed when TELEGRAM_WEBHOOK_SECRET is set and header is correct", async () => {
      vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", "super_secret");
      const { db } = await import("@/app/lib/db");
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const req = new Request("http://localhost:3000/api/webhooks/telegram", {
        method: "POST",
        headers: {
          "X-Telegram-Bot-Api-Secret-Token": "super_secret",
        },
        body: JSON.stringify({
          message: {
            chat: { id: 12345 },
            text: "/spend 14.50 GRO Walmart",
          },
        }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
