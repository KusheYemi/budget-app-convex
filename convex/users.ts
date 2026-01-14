import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";
import { auth } from "./auth";

export const isEmailInUse = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    if (!normalizedEmail) {
      return false;
    }

    const userByEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (userByEmail) {
      return true;
    }

    const accountByEmail = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "password").eq("providerAccountId", normalizedEmail),
      )
      .first();
    if (accountByEmail) {
      return true;
    }

    const [users, accounts] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("authAccounts").collect(),
    ]);
    return (
      users.some(
        (user) =>
          (user.email ?? "").trim().toLowerCase() === normalizedEmail,
      ) ||
      accounts.some(
        (account) =>
          account.provider === "password" &&
          account.providerAccountId.toLowerCase() === normalizedEmail,
      )
    );
  },
});

// Get current user's profile with categories
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort by sortOrder
    categories.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      ...user,
      categories,
    };
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

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const budgetMonths = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const needsOnboarding = categories.length === 0 || budgetMonths.length === 0;

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

    // Create default categories
    const defaultCategories = [
      { name: "Savings", color: "#6366f1", isSavings: true, sortOrder: 0 },
      { name: "Transport & Food", color: "#f59e0b", isSavings: false, sortOrder: 1 },
      { name: "Utilities", color: "#10b981", isSavings: false, sortOrder: 2 },
      { name: "Partner & Child Support", color: "#ec4899", isSavings: false, sortOrder: 3 },
      { name: "Subscriptions", color: "#8b5cf6", isSavings: false, sortOrder: 4 },
      { name: "Fun", color: "#06b6d4", isSavings: false, sortOrder: 5 },
      { name: "Remittance", color: "#f97316", isSavings: false, sortOrder: 6 },
    ];

    for (const cat of defaultCategories) {
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
        savingsRate: 0.20,
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

    const validCurrencies = ["SLE", "USD", "GBP", "EUR", "NGN"];
    if (!validCurrencies.includes(args.currency)) {
      throw new Error("Invalid currency");
    }

    await ctx.db.patch(userId, { currency: args.currency });
    return { success: true };
  },
});
