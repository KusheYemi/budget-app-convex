import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { Doc } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

const MIN_SAVINGS_RATE = 0.20;

// Helper to batch fetch categories and join with allocations
async function getAllocationsWithCategories(
  ctx: QueryCtx,
  allocations: Doc<"allocations">[]
) {
  // Collect unique category IDs
  const categoryIds = [...new Set(allocations.map((a) => a.categoryId))];

  // Batch fetch all categories at once
  const categories = await Promise.all(
    categoryIds.map((id) => ctx.db.get(id))
  );

  // Create a Map for O(1) lookups
  const categoryMap = new Map(
    categories
      .filter((c): c is Doc<"categories"> => c !== null)
      .map((c) => [c._id, c])
  );

  // Join allocations with categories
  return allocations.map((allocation) => ({
    ...allocation,
    category: categoryMap.get(allocation.categoryId) ?? null,
  }));
}

// Helper to get current month
function getCurrentMonth() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

// Get budget month with allocations
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

    // Get allocations with categories
    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", budgetMonth._id))
      .collect();

    // Batch fetch categories (avoids N+1 queries)
    const allocationsWithCategories = await getAllocationsWithCategories(ctx, allocations);

    // Sort by category sortOrder
    allocationsWithCategories.sort((a, b) => {
      const aOrder = a.category?.sortOrder ?? 0;
      const bOrder = b.category?.sortOrder ?? 0;
      return aOrder - bOrder;
    });

    return {
      ...budgetMonth,
      allocations: allocationsWithCategories,
    };
  },
});

// Get or create budget month
export const getOrCreateBudgetMonth = mutation({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if exists
    let budgetMonth = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", args.year).eq("month", args.month)
      )
      .first();

    if (!budgetMonth) {
      // Get most recent budget month to copy income from
      const allBudgets = await ctx.db
        .query("budgetMonths")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      // Sort to find most recent
      allBudgets.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      const lastBudget = allBudgets[0];

      const budgetId = await ctx.db.insert("budgetMonths", {
        userId,
        year: args.year,
        month: args.month,
        income: lastBudget?.income ?? 0,
        savingsRate: 0.20,
      });

      budgetMonth = await ctx.db.get(budgetId);
    }

    // Get allocations
    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", budgetMonth!._id))
      .collect();

    // Batch fetch categories (avoids N+1 queries)
    const allocationsWithCategories = await getAllocationsWithCategories(ctx, allocations);

    allocationsWithCategories.sort((a, b) => {
      const aOrder = a.category?.sortOrder ?? 0;
      const bOrder = b.category?.sortOrder ?? 0;
      return aOrder - bOrder;
    });

    return {
      ...budgetMonth,
      allocations: allocationsWithCategories,
    };
  },
});

// Update income
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

    const budgetMonth = await ctx.db.get(args.budgetMonthId);
    if (!budgetMonth || budgetMonth.userId !== userId) {
      throw new Error("Budget month not found");
    }

    await ctx.db.patch(args.budgetMonthId, { income: args.income });
    return { success: true };
  },
});

// Update savings rate
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

    const budgetMonth = await ctx.db.get(args.budgetMonthId);
    if (!budgetMonth || budgetMonth.userId !== userId) {
      throw new Error("Budget month not found");
    }

    await ctx.db.patch(args.budgetMonthId, {
      savingsRate: args.savingsRate,
      adjustmentReason: args.savingsRate < MIN_SAVINGS_RATE ? args.reason : undefined,
    });

    return { success: true };
  },
});

// Get all budget months
export const getAllBudgetMonths = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const budgetMonths = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort by year and month descending
    budgetMonths.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // Fetch all allocations for all budget months in parallel
    const allAllocationsArrays = await Promise.all(
      budgetMonths.map((bm) =>
        ctx.db
          .query("allocations")
          .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", bm._id))
          .collect()
      )
    );

    // Flatten and collect all unique category IDs
    const allAllocations = allAllocationsArrays.flat();
    const categoryIds = [...new Set(allAllocations.map((a) => a.categoryId))];

    // Batch fetch all categories at once
    const categories = await Promise.all(
      categoryIds.map((id) => ctx.db.get(id))
    );
    const categoryMap = new Map(
      categories
        .filter((c): c is Doc<"categories"> => c !== null)
        .map((c) => [c._id, c])
    );

    // Build result with joined data
    const result = budgetMonths.map((bm, index) => {
      const allocations = allAllocationsArrays[index];
      const allocationsWithCategories = allocations.map((a) => ({
        ...a,
        category: categoryMap.get(a.categoryId) ?? null,
      }));
      return { ...bm, allocations: allocationsWithCategories };
    });

    return result;
  },
});
