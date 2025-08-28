import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { auth } from "@/auth";
import { fetchAllFilteredTransactions } from "@/app/lib/data";

// src/app/api/transactions/[userId]/route.test.ts

// Mock dependencies
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/app/lib/data", () => ({
  fetchAllFilteredTransactions: vi.fn(),
}));

// could be null
interface User {
  id: string;
  name: string;
}

describe("GET /api/transactions/[userId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "any", name: "any" },
      expires: new Date().toISOString(),
    });

    const request = new Request("http://localhost:3000/api/transactions/123");
    const response = await GET(request, { params: { userId: "123" } });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: "Unauthenticated user or wrong user",
      data: [],
    });
  });

  it("should return 401 when user ID does not match", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "wrong-id", name: "Test User" },
      expires: new Date().toISOString(),
    });

    const request = new Request("http://localhost:3000/api/transactions/123");
    const response = await GET(request, { params: { userId: "123" } });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: "Unauthenticated user or wrong user",
      data: [],
    });
  });

  it("should return 200 with transactions when authenticated", async () => {
    const mockData = [{ id: 1, amount: 100 }];
    vi.mocked(auth).mockResolvedValue({
      user: { id: "123", name: "Test User" } as User,
      expires: new Date().toISOString(),
    });
    vi.mocked(fetchAllFilteredTransactions).mockResolvedValue(mockData);

    const request = new Request("http://localhost:3000/api/transactions/123");
    const response = await GET(request, { params: { userId: "123" } });
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
    vi.mocked(auth).mockResolvedValue({
      user: { id: "123", name: "Test User" } as User,
      expires: new Date().toISOString(),
    });
    vi.mocked(fetchAllFilteredTransactions).mockResolvedValue(mockData);

    const request = new Request(
      "http://localhost:3000/api/transactions/123?query=test&dates=2023",
    );
    const response = await GET(request, { params: { userId: "123" } });
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
