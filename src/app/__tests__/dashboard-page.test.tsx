import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../[locale]/dashboard/page";

// Mock the dal module for session verification
vi.mock("@/app/lib/dal", () => ({
  verifySession: vi.fn(() =>
    Promise.resolve({
      isAuth: true,
      user: {
        id: "test-user-123",
        email: "test@example.com",
        name: "Test User",
        emailVerified: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        image: null,
      },
    }),
  ),
}));

// Mock next-intl
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
}));

// Mock all data fetching functions
vi.mock("@/app/lib/data", () => ({
  fetchCardData: vi.fn(),
  fetchEssentialSpendDataByMonth: vi.fn(() =>
    Promise.resolve([
      { month: "1", total: 600 },
      { month: "2", total: 800 },
    ]),
  ),
  fetchIncomedDataByMonth: vi.fn(() =>
    Promise.resolve([
      { month: "1", total: 5000 },
      { month: "2", total: 5000 },
    ]),
  ),
  fetchNonEssentialSpendDataByMonth: vi.fn(() =>
    Promise.resolve([
      { month: "1", total: 400 },
      { month: "2", total: 700 },
    ]),
  ),
  fetchSpendDataByCategory: vi.fn(() =>
    Promise.resolve([
      { category: "Food", total: 500 },
      { category: "Transport", total: 300 },
    ]),
  ),
  fetchSpendDataByCategoryMonthly: vi.fn(() =>
    Promise.resolve([
      { category: "Food", total: 250 },
      { category: "Transport", total: 150 },
    ]),
  ),
  fetchSpendDataByMonth: vi.fn(() =>
    Promise.resolve([
      { month: "1", total: 1000 },
      { month: "2", total: 1500 },
    ]),
  ),
  fetchUserBudgetByMonth: vi.fn(() => Promise.resolve(5000)),
}));

// Mock UI components
vi.mock("@/app/ui/dashboard/cards", () => ({
  Cards: () => <div data-testid="cards-component">Cards Component</div>,
}));

vi.mock("@/app/ui/dashboard/expenses-month-chart", () => ({
  default: () => (
    <div data-testid="expenses-month-chart">Expenses Month Chart</div>
  ),
}));

vi.mock("@/app/ui/dashboard/essential-expenses-chart", () => ({
  default: () => (
    <div data-testid="essential-expenses-chart">Essential Expenses Chart</div>
  ),
}));

vi.mock("@/app/ui/dashboard/expenses-category-chart", () => ({
  default: () => (
    <div data-testid="expenses-category-chart">Expenses Category Chart</div>
  ),
}));

vi.mock("@/app/ui/dashboard/top-expenses-category-chart", () => ({
  default: () => (
    <div data-testid="top-expenses-category-chart">
      Top Expenses Category Chart
    </div>
  ),
}));

vi.mock("@/app/ui/dashboard/Toggle", () => ({
  default: () => <div data-testid="toggle-component">Toggle Component</div>,
}));

test("renders the dashboard page with heading", async () => {
  const PageComponent = await Page({});
  render(PageComponent);

  const heading = screen.getByRole("heading", {
    name: /Dashboard/i,
  });
  expect(heading).toBeDefined();
});

test("renders the Cards component for authenticated user", async () => {
  const PageComponent = await Page({});
  render(PageComponent);

  const cards = screen.getByTestId("cards-component");
  expect(cards).toBeDefined();
  expect(cards.textContent).toContain("Cards Component");
});

test("renders all chart components", async () => {
  const PageComponent = await Page({});
  render(PageComponent);

  const expensesMonthChart = screen.getByTestId("expenses-month-chart");
  const essentialExpensesChart = screen.getByTestId("essential-expenses-chart");
  const expensesCategoryChart = screen.getByTestId("expenses-category-chart");
  const topExpensesCategoryChart = screen.getByTestId(
    "top-expenses-category-chart",
  );

  expect(expensesMonthChart).toBeDefined();
  expect(essentialExpensesChart).toBeDefined();
  expect(expensesCategoryChart).toBeDefined();
  expect(topExpensesCategoryChart).toBeDefined();
});

test("renders Toggle component", async () => {
  const PageComponent = await Page({});
  render(PageComponent);

  const toggle = screen.getByTestId("toggle-component");
  expect(toggle).toBeDefined();
});

test("returns null when user is not authenticated", async () => {
  const { verifySession } = await import("@/app/lib/dal");
  vi.mocked(verifySession).mockResolvedValueOnce(
    undefined as unknown as Awaited<ReturnType<typeof verifySession>>,
  );

  const PageComponent = await Page({});
  expect(PageComponent).toBeNull();
});

test("renders with Month period by default", async () => {
  const PageComponent = await Page({});
  render(PageComponent);

  // Should render the page successfully with default period
  const heading = screen.getByRole("heading", {
    name: /Dashboard/i,
  });
  expect(heading).toBeDefined();
});

test("renders with custom period from search params", async () => {
  const PageComponent = await Page({
    searchParams: Promise.resolve({ period: "Year" }),
  });
  render(PageComponent);

  // Should render the page successfully with custom period
  const heading = screen.getByRole("heading", {
    name: /Dashboard/i,
  });
  expect(heading).toBeDefined();
});
