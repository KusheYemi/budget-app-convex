import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { DEFAULT_SAVINGS_RATE, VALID_CURRENCIES, DEFAULT_CATEGORIES } from "./constants";

// Get current user's profile with categories
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

// Check if user needs onboarding
export const checkOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { needsOnboarding: false, user: null };

    const user = await ctx.db.get(userId);
    if (!user) return { needsOnboarding: true, user: null };

    const [firstCategory, firstBudgetMonth] = await Promise.all([
      ctx.db
        .query("categories")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("budgetMonths")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
    ]);

    const needsOnboarding = !firstCategory || !firstBudgetMonth;

    return { needsOnboarding, user };
  },
});

// Complete onboarding
export const completeOnboarding = mutation({
  args: {
    income: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Update user currency
    await ctx.db.patch(userId, { currency: args.currency });

    for (const cat of DEFAULT_CATEGORIES) {
      // Check if category already exists
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", cat.name))
        .first();

      if (!existing) {
        await ctx.db.insert("categories", {
          userId,
          name: cat.name,
          color: cat.color,
          isSavings: cat.isSavings,
          isDefault: true,
          sortOrder: cat.sortOrder,
        });
      }
    }

    // Check if budget month already exists
    const existingBudget = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", year).eq("month", month)
      )
      .first();

    if (!existingBudget) {
      await ctx.db.insert("budgetMonths", {
        userId,
        year,
        month,
        income: args.income,
        savingsRate: DEFAULT_SAVINGS_RATE,
      });
    } else {
      await ctx.db.patch(existingBudget._id, { income: args.income });
    }

    return { success: true };
  },
});

// Update user currency
export const updateCurrency = mutation({
  args: {
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!VALID_CURRENCIES.includes(args.currency as typeof VALID_CURRENCIES[number])) {
      throw new Error("Invalid currency");
    }

    await ctx.db.patch(userId, { currency: args.currency });
    return { success: true };
  },
});
