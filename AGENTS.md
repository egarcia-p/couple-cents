# AGENTS.md - Agentic Coding Guidelines

This file provides guidelines and reference information for AI agents working in this codebase.

## Project Overview

- **Framework**: Next.js 15 (App Router) with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + MUI (Material UI)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Testing**: Vitest (unit) + Playwright (e2e)
- **i18n**: next-intl

## Build / Lint / Test Commands

```bash
# Development
npm run dev                 # Start dev server (localhost:3000)

# Build
npm run build               # Run DB migration + Next.js build
npm run start               # Start production server

# Linting & Formatting
npm run lint                # Run ESLint (extends next/core-web-vitals + prettier)
npx prettier --write .      # Format all files

# Database
npm run db:migrate          # Run Drizzle migrations
npm run db:seed             # Seed database with test data
npm run db:seed:demo        # Seed with demo data
npm run db:studio           # Open Drizzle Studio
npm run db:encrypt          # Migrate existing data to encrypted format

# Testing
npm run test                # Run all unit tests (Vitest)
npm run test -- --run       # Run tests once (no watch mode)
npm run test -- src/app/lib/__tests__/actions.test.ts  # Run single test file
npm run test -- --testNamePattern "createTransaction"  # Run tests matching name
npm run test:e2e            # Run Playwright e2e tests
```

### Running a Single Test

```bash
# Run specific test file
npm run test -- src/app/lib/__tests__/actions.test.ts

# Run specific test by name
npm run test -- --testNamePattern "should encrypt"

# Run in non-watch mode
npm run test -- --run src/app/lib/__tests__/actions.test.ts
```

## Code Style Guidelines

### General Principles

- Use functional components with hooks (no class components)
- Keep components small and focused (single responsibility)
- Use explicit typing - avoid `any` unless absolutely necessary
- Prefer composition over abstraction
- Handle errors gracefully with user-friendly messages

### TypeScript

- Use `zod` for form validation and runtime type checking
- Use TypeScript strict mode (inherited from Next.js defaults)
- Define explicit return types for utility functions
- Use `interface` for object shapes, `type` for unions/intersections

```typescript
// Good
interface Transaction {
  id: string;
  amount: number;
  category: string;
}

type TransactionInput = Omit<Transaction, 'id'>;

// Avoid
const getData = (data: any) => { ... }
```

### Imports

Organize imports in the following order (separate with blank lines):

1. Next.js / React imports (`next`, `react`)
2. Third-party libraries (e.g., `zod`, `drizzle-orm`)
3. Internal imports (relative paths starting with `@/` or `../`)
4. Type imports

```typescript
import { useState, useEffect } from "react";
import { use } from "react";
import z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { transactions, userSettings } from "../../../drizzle/schema";
import { fetchUserSettings } from "./data";
import { encrypt } from "./crypto";
import type { State } from "./types";
```

### Naming Conventions

- **Files**: Use kebab-case for utilities (`crypto.ts`), PascalCase for components (`TransactionForm.tsx`)
- **Functions**: Use camelCase, prefix with verb (`getUserData`, `createTransaction`)
- **Components**: Use PascalCase
- **Constants**: Use UPPER_SNAKE_CASE for magic numbers/strings
- **Types/Interfaces**: Use PascalCase with descriptive names

### Server Actions ("use server")

- Mark all server actions with `"use server"` directive
- Use Zod for form validation with user-friendly error messages
- Return typed state objects for form handling

```typescript
"use server";

import z from "zod";

const FormSchema = z.object({
  amount: z.coerce.number().gt(0, { message: "validation.amount" }),
  // ...
});

export type State = {
  errors?: Partial<Record<string, string[]>>;
  message?: string | null;
};

export async function createTransaction(prevState: State, formData: FormData) {
  const validatedFields = CreateTransaction.safeParse(...);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  // ... proceed with action
}
```

### Component Structure

```typescript
// Component file structure
"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

interface Props {
  title: string;
  onSubmit: () => void;
  className?: string;
}

export function MyComponent({ title, onSubmit, className }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // side effects
  }, []);

  return (
    <div className={clsx("base-classes", className)}>
      {title}
    </div>
  );
}
```

### Error Handling

- Use try/catch for async operations
- Return meaningful error messages to users via translations
- Log errors appropriately for debugging
- Use Zod for validation errors with i18n keys

```typescript
try {
  await createTransaction(prevState, formData);
} catch (error) {
  console.error("Failed to create transaction:", error);
  return { message: "errors.generic" };
}
```

### Testing

- Use Vitest with jsdom environment
- Mock external dependencies (db, next-intl, next/navigation)
- Use `vi.mock()` for module mocking
- Test both success and error cases
- Name tests descriptively: `"function name - expected behavior"`

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db", () => ({ db: { insert: vi.fn() } }));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
}));

describe("createTransaction", () => {
  it("should encrypt amount before inserting", async () => {
    // test implementation
  });
});
```

### Tailwind CSS

- Use utility classes consistently
- Use `clsx` or `cn()` for conditional classes
- Follow existing color/spacing patterns in the codebase
- Avoid custom CSS - prefer Tailwind utilities

### Database (Drizzle ORM)

- Use Drizzle for all database operations
- Define schemas in `drizzle/schema.ts`
- Use migrations for schema changes (`npm run db:migrate`)
- Encrypt sensitive data (amounts, establishment names) before storing

### Internationalization (i18n)

- Use `next-intl` for all user-facing strings
- Translation files in `messages/` directory
- Use translation keys, not hardcoded strings
- Use `await getTranslations()` in Server Components and Actions

```typescript
const t = await getTranslations("TransactionsPage");
return { message: t("validation.amount") };
```

### Environment Variables

- Never commit secrets to the repository
- Use `.env.local` for local development
- Required variables documented in `.env.example`
- Use `process.env.VARIABLE_NAME` with proper typing

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── lib/               # Shared utilities, actions, db
│   │   ├── __tests__/    # Unit tests
│   │   ├── actions.ts    # Server actions
│   │   ├── data.ts       # Data fetching
│   │   ├── db.ts         # Database connection
│   │   └── helpers/      # Helper functions
│   └── ui/               # UI components
│       ├── dashboard/
│       ├── transactions/
│       └── hooks/        # Custom React hooks
├── drizzle/              # Database schema & migrations
└── messages/             # Translation files (en-US.json, es-MX.json)
```

## Key Configuration Files

- `vitest.config.mts` - Test configuration with jsdom
- `.eslintrc.json` - Extends Next.js + Prettier
- `.prettierrc` - 2 spaces, 80 char width
- `tailwind.config.ts` - Tailwind configuration
- `next.config.mjs` - Next.js configuration
