import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { auth } from "./auth";
import {
  isEditableMonth,
  requireOwnedBudgetMonth,
  requireOwnedNonSavingsCategory,
} from "./utils";

export const updateAllocation = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
    categoryId: v.id("categories"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.amount < 0) {
      throw new Error("Amount cannot be negative");
    }

    await requireOwnedBudgetMonth(ctx, args.budgetMonthId, userId);
    await requireOwnedNonSavingsCategory(ctx, args.categoryId, userId);

    const existing = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth_category", (q) =>
        q.eq("budgetMonthId", args.budgetMonthId).eq("categoryId", args.categoryId)
      )
      .first();

    if (args.amount === 0) {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    } else if (existing) {
      await ctx.db.patch(existing._id, { amount: args.amount });
    } else {
      await ctx.db.insert("allocations", {
        budgetMonthId: args.budgetMonthId,
        categoryId: args.categoryId,
        amount: args.amount,
      });
    }

    return { success: true };
  },
});

export const deleteAllocation = mutation({
  args: {
    allocationId: v.id("allocations"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const allocation = await ctx.db.get(args.allocationId);
    if (!allocation) {
      throw new Error("Allocation not found");
    }

    await requireOwnedBudgetMonth(ctx, allocation.budgetMonthId, userId);

    await ctx.db.delete(args.allocationId);
    return { success: true };
  },
});

export const removeFromMonth = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await requireOwnedBudgetMonth(ctx, args.budgetMonthId, userId);
    await requireOwnedNonSavingsCategory(ctx, args.categoryId, userId);

    const allocation = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth_category", (q) =>
        q.eq("budgetMonthId", args.budgetMonthId).eq("categoryId", args.categoryId)
      )
      .first();

    if (allocation) {
      await ctx.db.delete(allocation._id);
    }

    return { success: true };
  },
});

export const addToMonth = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await requireOwnedBudgetMonth(ctx, args.budgetMonthId, userId);
    await requireOwnedNonSavingsCategory(ctx, args.categoryId, userId);

    const existing = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth_category", (q) =>
        q.eq("budgetMonthId", args.budgetMonthId).eq("categoryId", args.categoryId)
      )
      .first();

    if (existing) {
      return { success: true };
    }

    await ctx.db.insert("allocations", {
      budgetMonthId: args.budgetMonthId,
      categoryId: args.categoryId,
      amount: 0,
    });

    return { success: true };
  },
});

export const copyAllocationsFromPreviousMonthAuto = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const targetBudgetMonth = await requireOwnedBudgetMonth(ctx, args.budgetMonthId, userId);

    if (!isEditableMonth(targetBudgetMonth.year, targetBudgetMonth.month)) {
      throw new Error("Cannot copy into a past month");
    }

    const allBudgetMonths = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const previousMonths = allBudgetMonths
      .filter((bm) => {
        if (bm.year < targetBudgetMonth.year) return true;
        if (bm.year === targetBudgetMonth.year && bm.month < targetBudgetMonth.month) return true;
        return false;
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    const previousBudgetMonth = previousMonths[0];

    if (!previousBudgetMonth) {
      throw new Error("No previous month found to copy from");
    }

    const sourceAllocations = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", previousBudgetMonth._id))
      .collect();

    for (const allocation of sourceAllocations) {
      const category = await ctx.db.get(allocation.categoryId);
      if (!category || category.isSavings) continue;

      const existing = await ctx.db
        .query("allocations")
        .withIndex("by_budgetMonth_category", (q) =>
          q.eq("budgetMonthId", args.budgetMonthId).eq("categoryId", allocation.categoryId)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { amount: allocation.amount });
      } else {
        await ctx.db.insert("allocations", {
          budgetMonthId: args.budgetMonthId,
          categoryId: allocation.categoryId,
          amount: allocation.amount,
        });
      }
    }

    return { success: true };
  },
});
