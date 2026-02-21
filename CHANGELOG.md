# Changelog

All notable changes to this project will be documented in this file.

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
