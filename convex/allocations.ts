import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { auth } from "./auth";
import { MAX_FUTURE_MONTHS } from "./constants";
import { getCurrentMonth } from "./utils";

// Helper to check if a month is editable (current or future within limit)
function isEditableMonth(year: number, month: number): boolean {
  const { year: currentYear, month: currentMonth } = getCurrentMonth();

  // Past months are not editable
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  // Check if within 12 month future limit
  const monthsAhead = (year - currentYear) * 12 + (month - currentMonth);
  return monthsAhead <= MAX_FUTURE_MONTHS;
}

// Update or create an allocation
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

    // Verify budget month belongs to user
    const budgetMonth = await ctx.db.get(args.budgetMonthId);
    if (!budgetMonth || budgetMonth.userId !== userId) {
      throw new Error("Budget month not found");
    }

    // Verify category belongs to user
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    // Don't allow allocations for Savings category
    if (category.isSavings) {
      throw new Error("Savings allocation is calculated automatically");
    }

    // Find existing allocation
    const existing = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth_category", (q) =>
        q.eq("budgetMonthId", args.budgetMonthId).eq("categoryId", args.categoryId)
      )
      .first();

    if (args.amount === 0) {
      // Delete if amount is 0
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    } else if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, { amount: args.amount });
    } else {
      // Create new
      await ctx.db.insert("allocations", {
        budgetMonthId: args.budgetMonthId,
        categoryId: args.categoryId,
        amount: args.amount,
      });
    }

    return { success: true };
  },
});

// Delete an allocation
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

    // Verify budget month belongs to user
    const budgetMonth = await ctx.db.get(allocation.budgetMonthId);
    if (!budgetMonth || budgetMonth.userId !== userId) {
      throw new Error("Allocation not found");
    }

    await ctx.db.delete(args.allocationId);
    return { success: true };
  },
});

// Remove a category from a specific budget month (deletes allocation only, keeps category)
export const removeFromMonth = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify budget month belongs to user
    const budgetMonth = await ctx.db.get(args.budgetMonthId);
    if (!budgetMonth || budgetMonth.userId !== userId) {
      throw new Error("Budget month not found");
    }

    // Verify category belongs to user
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    // Don't allow removing Savings category
    if (category.isSavings) {
      throw new Error("Cannot remove the Savings category");
    }

    // Find and delete the allocation for this month
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

// Copy allocations from previous month (auto-detect)
export const copyAllocationsFromPreviousMonthAuto = mutation({
  args: {
    budgetMonthId: v.id("budgetMonths"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const targetBudgetMonth = await ctx.db.get(args.budgetMonthId);
    if (!targetBudgetMonth || targetBudgetMonth.userId !== userId) {
      throw new Error("Budget month not found");
    }

    if (!isEditableMonth(targetBudgetMonth.year, targetBudgetMonth.month)) {
      throw new Error("Cannot copy into a past month");
    }

    // Find the most recent budget month before the target (not necessarily the immediately previous month)
    const allBudgetMonths = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter to months before the target, then sort to get most recent
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

    // Get and copy allocations
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
