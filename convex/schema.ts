import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Extend users table with app-specific fields
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    isAnonymous: v.optional(v.boolean()),
    // App-specific fields
    currency: v.optional(v.string()), // SLE, USD, GBP, EUR, NGN
  }).index("email", ["email"]),

  budgetMonths: defineTable({
    userId: v.id("users"),
    year: v.number(),
    month: v.number(), // 1-12
    income: v.number(), // Stored in cents (e.g., $100.50 = 10050)
    savingsRate: v.float64(), // 0.0 to 1.0
    adjustmentReason: v.optional(v.string()), // Required when savingsRate < 0.20
  })
    .index("by_user", ["userId"])
    .index("by_user_year_month", ["userId", "year", "month"]),

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(), // Hex color like #6366f1
    isSavings: v.boolean(),
    isDefault: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"])
    .index("by_user_sortOrder", ["userId", "sortOrder"]),

  allocations: defineTable({
    budgetMonthId: v.id("budgetMonths"),
    categoryId: v.id("categories"),
    amount: v.number(), // Stored in cents
  })
    .index("by_budgetMonth", ["budgetMonthId"])
    .index("by_category", ["categoryId"])
    .index("by_budgetMonth_category", ["budgetMonthId", "categoryId"]),
});
