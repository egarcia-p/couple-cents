import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../[locale]/page";

vi.mock("@/auth");

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      title: "Couple Cents App",
      footerText:
        "CoupleCents App. This project is licensed under the Apache license - see the LICENSE file for details. For contributions and support, visit our",
      githubLinkText: "GitHub",
      repositoryLinkText: "repository.",
    };
    return translations[key] || key;
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock next/head
vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock auth components
vi.mock("../components/auth/sign-in-github", () => ({
  SignInWithGitHub: () => <button type="button">Sign in with GitHub</button>,
}));

vi.mock("../components/auth/sign-in-google", () => ({
  SignInWithGoogle: () => <button type="button">Sign in with Google</button>,
}));

vi.mock("../components/auth/sign-up", () => ({
  default: () => <form data-testid="signup-form">Sign Up Form</form>,
}));

vi.mock("../components/auth/sign-in-email", () => ({
  default: () => <form data-testid="login-form">Login Form</form>,
}));

// Mock featureflags
vi.mock("../lib/featureflags", () => ({
  featureFlags: {
    enableGoogleAuth: true,
  },
}));

test("renders the landing page", async () => {
  render(<Page />);

  const heading = screen.getByRole("heading", {
    name: /Couple Cents App/i,
  });
  expect(heading).toBeDefined();
});

test("renders the sign-in component", async () => {
  render(<Page />);

  const signIn = screen.getByRole("button", {
    name: /Sign in with GitHub/i,
  });
  expect(signIn).toBeDefined();
});

test("render the footer message", async () => {
  render(<Page />);

  const footerText =
    new Date().getFullYear() +
    " CoupleCents App. This project is licensed under the Apache license - see the LICENSE file for details. For contributions and support, visit our";

  const footer = screen.getByText(new RegExp(footerText, "i"));
  expect(footer).toBeDefined();
});
