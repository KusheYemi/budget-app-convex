// Shared constants for Convex backend modules.
// Note: frontend equivalents live in src/lib/utils.ts and src/lib/validators.ts.
// These cannot be shared across the boundary, but the values must be kept in sync.

/** Minimum recommended savings rate (20%). */
export const MIN_SAVINGS_RATE = 0.20;

/** Default savings rate applied to newly created budget months. */
export const DEFAULT_SAVINGS_RATE = 0.20;

/** How many months ahead of the current month a user can plan/edit. */
export const MAX_FUTURE_MONTHS = 12;

/** Accepted currency codes. Must stay in sync with CURRENCIES in src/lib/validators.ts. */
export const VALID_CURRENCIES = ["SLE", "USD", "GBP", "EUR", "NGN"] as const;

/** Default categories created for new users on sign up. Must stay in sync with DEFAULT_CATEGORY_NAMES in src/lib/utils.ts. */
export const DEFAULT_CATEGORIES = [
  { name: "Savings", color: "#6366f1", isSavings: true, sortOrder: 0 },
  { name: "Transport & Food", color: "#f59e0b", isSavings: false, sortOrder: 1 },
  { name: "Utilities", color: "#10b981", isSavings: false, sortOrder: 2 },
  { name: "Partner & Child Support", color: "#ec4899", isSavings: false, sortOrder: 3 },
  { name: "Subscriptions", color: "#8b5cf6", isSavings: false, sortOrder: 4 },
  { name: "Fun", color: "#06b6d4", isSavings: false, sortOrder: 5 },
  { name: "Remittance", color: "#f97316", isSavings: false, sortOrder: 6 },
];
