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

test("renders the sign-in component", async () => {
  const PageComponent = await Page();
  render(PageComponent);

  const signIn = screen.getByRole("button", {
    name: /Sign in with GitHub/i,
  });
  expect(signIn).toBeDefined();
});

test("render the footer message", async () => {
  const PageComponent = await Page();
  render(PageComponent);

  const footerText =
    new Date().getFullYear() +
    " CoupleCents App. This project is licensed under the Apache license - see the LICENSE file for details. For contributions and support, visit our";

  const footer = screen.getByText(new RegExp(footerText, "i"));
  expect(footer).toBeDefined();
});
