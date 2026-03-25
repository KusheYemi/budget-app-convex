import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { MIN_SAVINGS_RATE, DEFAULT_SAVINGS_RATE } from "./constants";
import {
  getCurrentMonth,
  byMonthDesc,
  getSortedAllocationsWithCategories,
  requireOwnedBudgetMonth,
} from "./utils";

export const getBudgetMonth = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const current = getCurrentMonth();
    const targetYear = args.year ?? current.year;
    const targetMonth = args.month ?? current.month;

    const budgetMonth = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", targetYear).eq("month", targetMonth)
      )
      .first();

    if (!budgetMonth) return null;

    const allocations = await getSortedAllocationsWithCategories(ctx, budgetMonth._id);

    return {
      ...budgetMonth,
      allocations,
    };
  },
});

export const getOrCreateBudgetMonth = mutation({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let budgetMonth = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", args.year).eq("month", args.month)
      )
      .first();

    if (!budgetMonth) {
      const allBudgets = await ctx.db
        .query("budgetMonths")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      allBudgets.sort(byMonthDesc);

      const lastBudget = allBudgets[0];

      const budgetId = await ctx.db.insert("budgetMonths", {
        userId,
        year: args.year,
        month: args.month,
        income: lastBudget?.income ?? 0,
        savingsRate: DEFAULT_SAVINGS_RATE,
      });

      budgetMonth = await ctx.db.get(budgetId);
    }

    const allocations = await getSortedAllocationsWithCategories(ctx, budgetMonth!._id);

    return {
      ...budgetMonth,
      allocations,
    };
  },
});

export const updateIncome = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
    income: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.income < 0) {
      throw new Error("Income cannot be negative");
    }

    await requireOwnedBudgetMonth(ctx, args.budgetMonthId, userId);

    await ctx.db.patch(args.budgetMonthId, { income: args.income });
    return { success: true };
  },
});

export const updateSavingsRate = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
    savingsRate: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.savingsRate < 0 || args.savingsRate > 1) {
      throw new Error("Savings rate must be between 0% and 100%");
    }

    if (args.savingsRate < MIN_SAVINGS_RATE) {
      if (!args.reason || args.reason.trim().length < 10) {
        throw new Error(
          "Please provide a reason (at least 10 characters) for saving less than 20%"
        );
      }
    }

    await requireOwnedBudgetMonth(ctx, args.budgetMonthId, userId);

    await ctx.db.patch(args.budgetMonthId, {
      savingsRate: args.savingsRate,
      adjustmentReason: args.savingsRate < MIN_SAVINGS_RATE ? args.reason : undefined,
    });

    return { success: true };
  },
});
