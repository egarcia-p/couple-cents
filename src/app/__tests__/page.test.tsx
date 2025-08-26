import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

vi.mock("@/auth");

test("renders the landing page", async () => {
  const PageComponent = await Page();
  render(PageComponent);

  const heading = screen.getByRole("heading", {
    name: /Couple Cents App/i,
  });
  expect(heading).toBeDefined();
});
