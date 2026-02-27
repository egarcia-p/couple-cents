import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { verifySession } from "@/app/lib/dal";
import { fetchAllFilteredTransactions } from "@/app/lib/data";

// src/app/api/transactions/[userId]/route.test.ts

// Mock dependencies
vi.mock("@/app/lib/dal", () => ({
  verifySession: vi.fn(),
}));

vi.mock("@/app/lib/data", () => ({
  fetchAllFilteredTransactions: vi.fn(),
}));

const mockUser = {
  id: "123",
  name: "Test User",
  email: "test@example.com",
  emailVerified: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  image: null,
};

const mockTransaction = {
  id: "tx-1",
  userId: "123",
  transactionDate: new Date("2024-01-15"),
  category: "food",
  establishment: "Test Store",
  isExpense: true,
  isEssential: true,
  note: null,
  amount: 100,
};

describe("GET /api/transactions/[userId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when there is no session", async () => {
    // verifySession redirects when unauthenticated, but the route checks
    // for falsy return. Mock as returning undefined to simulate no session.
    vi.mocked(verifySession).mockResolvedValue(
      undefined as unknown as Awaited<ReturnType<typeof verifySession>>,
    );

    const request = new Request("http://localhost:3000/api/transactions/123");
    const response = await GET(request, {
      params: Promise.resolve({ userId: "123" }),
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: "Unauthorized",
      data: [],
    });
  });

  it("should return 401 when user ID does not match", async () => {
    vi.mocked(verifySession).mockResolvedValue({
      isAuth: true,
      user: { ...mockUser, id: "wrong-id" },
    });

    const request = new Request("http://localhost:3000/api/transactions/123");
    const response = await GET(request, {
      params: Promise.resolve({ userId: "123" }),
    });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: "Unauthenticated user or wrong user",
      data: [],
    });
  });

  it("should return 200 with transactions when authenticated", async () => {
    const mockData = [mockTransaction];
    vi.mocked(verifySession).mockResolvedValue({
      isAuth: true,
      user: mockUser,
    });
    vi.mocked(fetchAllFilteredTransactions).mockResolvedValue(mockData);

    const request = new Request("http://localhost:3000/api/transactions/123");
    const response = await GET(request, {
      params: Promise.resolve({ userId: "123" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Success");
    expect(body.data).toHaveLength(1);
    expect(fetchAllFilteredTransactions).toHaveBeenCalledWith({
      query: "",
      userId: "123",
      dates: "",
    });
  });

  it("should handle query parameters correctly", async () => {
    const mockData = [mockTransaction];
    vi.mocked(verifySession).mockResolvedValue({
      isAuth: true,
      user: mockUser,
    });
    vi.mocked(fetchAllFilteredTransactions).mockResolvedValue(mockData);

    const request = new Request(
      "http://localhost:3000/api/transactions/123?query=test&dates=2023",
    );
    const response = await GET(request, {
      params: Promise.resolve({ userId: "123" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Success");
    expect(body.data).toHaveLength(1);
    expect(fetchAllFilteredTransactions).toHaveBeenCalledWith({
      query: "test",
      userId: "123",
      dates: "2023",
    });
  });
});
