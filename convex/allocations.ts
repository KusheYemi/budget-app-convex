import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Helper to check if a month is current
function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date();
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

// Get allocations for a budget month
export const getAllocations = query({
  args: {
    budgetMonthId: v.id("budgetMonths"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Verify budget month belongs to user
    const budgetMonth = await ctx.db.get(args.budgetMonthId);
    if (!budgetMonth || budgetMonth.userId !== userId) {
      return [];
    }

    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", args.budgetMonthId))
      .collect();

    // Get categories and sort
    const allocationsWithCategories = await Promise.all(
      allocations.map(async (allocation) => {
        const category = await ctx.db.get(allocation.categoryId);
        return { ...allocation, category };
      })
    );

    allocationsWithCategories.sort((a, b) => {
      const aOrder = a.category?.sortOrder ?? 0;
      const bOrder = b.category?.sortOrder ?? 0;
      return aOrder - bOrder;
    });

    return allocationsWithCategories;
  },
});

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

// Copy allocations from previous month
export const copyAllocationsFromPreviousMonth = mutation({
  args: {
    toBudgetMonthId: v.id("budgetMonths"),
    fromBudgetMonthId: v.id("budgetMonths"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify target budget month
    const targetBudgetMonth = await ctx.db.get(args.toBudgetMonthId);
    if (!targetBudgetMonth || targetBudgetMonth.userId !== userId) {
      throw new Error("Budget month not found");
    }

    // Get source allocations (exclude savings)
    const sourceAllocations = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", args.fromBudgetMonthId))
      .collect();

    // Filter out savings categories
    const validAllocations = [];
    for (const allocation of sourceAllocations) {
      const category = await ctx.db.get(allocation.categoryId);
      if (category && !category.isSavings && category.userId === userId) {
        validAllocations.push(allocation);
      }
    }

    // Upsert allocations
    for (const allocation of validAllocations) {
      const existing = await ctx.db
        .query("allocations")
        .withIndex("by_budgetMonth_category", (q) =>
          q.eq("budgetMonthId", args.toBudgetMonthId).eq("categoryId", allocation.categoryId)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { amount: allocation.amount });
      } else {
        await ctx.db.insert("allocations", {
          budgetMonthId: args.toBudgetMonthId,
          categoryId: allocation.categoryId,
          amount: allocation.amount,
        });
      }
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

    if (!isCurrentMonth(targetBudgetMonth.year, targetBudgetMonth.month)) {
      throw new Error("Cannot copy into a historical month");
    }

    // Calculate previous month
    let prevYear = targetBudgetMonth.year;
    let prevMonth = targetBudgetMonth.month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    // Find previous budget month
    const previousBudgetMonth = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", prevYear).eq("month", prevMonth)
      )
      .first();

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
