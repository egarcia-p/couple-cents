# Changelog

All notable changes to this project will be documented in this file.

## [0.9.2] - 2026-03-07

### Changed

- **React Hook Migration**
  - Migrated from deprecated `useFormState` (react-dom) to `useActionState` (react)
  - Updated form components: create-form, edit-form, settings, and language-settings
  - Ensures compatibility with React 19+ and maintains component functionality

## [0.9.0] - 2026-03-03

### Added

- **E2E Test Suite for Search & Filtering**
  - Comprehensive search functionality tests for transaction filtering
  - Case-insensitive search validation
  - Category filtering tests
  - Empty state handling when no results found
  - Support for both desktop and mobile search inputs

### Changed

- Enhanced test infrastructure with improved database seeding capabilities

### Security

- Reviewed and validated cryptographic implementation (AES-256-GCM)
  - Confirmed authenticated encryption with random IVs
  - Validated key management and environment-based configuration

## [0.8.8] - 2026-03-05

### Added

- **Maintenance Mode Setup**

  - Added `vercel.json` configuration for maintenance page redirects
  - Created simple maintenance page (`public/maintenance.html`) for deployment downtime
  - Allows easy deployment of bug fixes without affecting production visibility

- **Security Improvements**
  - Added encryption key generation script for AES-256 encryption setup
  - Improved documentation for encryption management

### Changed

- Prepared infrastructure for bug deployment workflow

## [0.8.7] - 2026-02-25

### Added

- **Test Suite Enhancements**
  - Created comprehensive dashboard page tests (7 test cases)
  - Added proper mocking for next-intl, Next.js components, and auth modules
  - Validated cards, charts, and toggle components rendering

### Fixed

- Fixed 7 failing date-time utility tests by correcting date format handling
- Fixed 3 landing page tests with proper NextIntlClientProvider mocking
- Fixed API route tests to use `verifySession` instead of deprecated auth import
- Added `@public` alias to vitest configuration for proper asset resolution

### Security

- **Next.js Upgrade**: Updated from 14.2.35 to 15.5.12 (addresses MEDIUM severity vulnerability)
- Updated `eslint-config-next` to 15.5.12 to match Next.js version

## [0.8.6] - 2026-02-25

### Fixed

- Fixed dashboard card titles overflow with text truncation and tooltip
- Added `line-clamp-1` to prevent card titles from wrapping to multiple lines
- Added hover tooltip to show full title text when truncated

## [0.8.5] - 2026-02-25

### Changed

- Fixed the dashboard charts tooltip to show the curency
- Code quality enhancements for managing locale for charts.

## [0.8.4] - 2026-02-24

### Changed

- Minor improvements and bug fixes to the income categories

## [0.8.3] - 2026-02-21

### Added

- **Category Helper Library** (`src/app/lib/helpers/categories.ts`)

  - `getTranslatedCategories()` - Translates category keys to localized names (server-side)
  - `getFormCategories()` - Returns translated categories for forms based on expense/income type
  - `getAllCategoriesMap()` - Returns combined map of all categories (expenses + income)
  - `getTranslatedAllCategoriesMap()` - Returns translated combined category map
  - `getExpenseCategories()` - Returns raw expense categories object
  - `getIncomeCategories()` - Returns raw income categories object

- **Type Definitions** (`src/app/lib/definitions.ts`)
  - `Category` type with id and name fields
  - `Categories` type for category key-value mappings

### Changed

- **Transaction Pages** - Updated to use centralized category helpers

  - `src/app/[locale]/dashboard/transactions/create/page.tsx` - Now uses `getFormCategories()`
  - `src/app/[locale]/dashboard/transactions/[id]/edit/page.tsx` - Now uses `getFormCategories()`

- **Data Layer** (`src/app/lib/data.ts`) - Database queries now return translated category names

  - `fetchAllTransactions()` - Returns translated category names
  - `fetchAllFilteredTransactions()` - Uses translated categories for filtering and display
  - `fetchFilteredTransactions()` - Uses translated categories for filtering and display

- **UI Hooks**
  - `src/app/ui/hooks/useSpendArray.ts` - Updated to use `getExpenseCategories()` helper

### Refactored

- Removed duplicate category type definitions across components
- Centralized all category data access through helper library
- Replaced direct JSON imports with helper functions for better maintainability
- Improved code organization and reusability

### Benefits

- **Internationalization**: Category names are now automatically translated based on user locale
- **Maintainability**: Single source of truth for category data access
- **Consistency**: All components use the same helper functions
- **Type Safety**: Shared type definitions across the application
