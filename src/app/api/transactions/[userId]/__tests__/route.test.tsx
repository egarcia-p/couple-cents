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

describe("GET /api/transactions/[userId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when there is no session", async () => {
    vi.mocked(verifySession).mockResolvedValue(null);

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
      user: { id: "wrong-id", name: "Test User", email: "test@example.com" },
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
    const mockData = [{ id: 1, amount: 100 }];
    vi.mocked(verifySession).mockResolvedValue({
      isAuth: true,
      user: { id: "123", name: "Test User", email: "test@example.com" },
    });
    vi.mocked(fetchAllFilteredTransactions).mockResolvedValue(mockData);

    const request = new Request("http://localhost:3000/api/transactions/123");
    const response = await GET(request, {
      params: Promise.resolve({ userId: "123" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      message: "Success",
      data: mockData,
    });
    expect(fetchAllFilteredTransactions).toHaveBeenCalledWith({
      query: "",
      userId: "123",
      dates: "",
    });
  });

  it("should handle query parameters correctly", async () => {
    const mockData = [{ id: 1, amount: 100 }];
    vi.mocked(verifySession).mockResolvedValue({
      isAuth: true,
      user: { id: "123", name: "Test User", email: "test@example.com" },
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
    expect(body).toEqual({
      message: "Success",
      data: mockData,
    });
    expect(fetchAllFilteredTransactions).toHaveBeenCalledWith({
      query: "test",
      userId: "123",
      dates: "2023",
    });
  });
});
