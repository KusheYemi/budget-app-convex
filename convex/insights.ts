import { query } from "./_generated/server";
import { auth } from "./auth";
import { Doc } from "./_generated/dataModel";

const MIN_SAVINGS_RATE = 0.20;

export interface MonthlyData {
  year: number;
  month: number;
  income: number;
  savingsRate: number;
  savingsAmount: number;
  totalAllocated: number;
  adjustmentReason: string | null;
}

export interface CategoryTotal {
  name: string;
  color: string;
  total: number;
}

// Get insights data
export const getInsightsData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    // Get all budget months
    const budgetMonths = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (budgetMonths.length === 0) {
      return {
        averageIncome: 0,
        averageSavingsRate: 0,
        averageSavingsAmount: 0,
        totalSaved: 0,
        totalMonths: 0,
        monthsWithLowSavings: [],
        topCategories: [],
        monthlyTrends: [],
      };
    }

    // Sort by year and month ascending
    budgetMonths.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Batch fetch all allocations for all budget months in parallel
    const allAllocationsArrays = await Promise.all(
      budgetMonths.map((bm) =>
        ctx.db
          .query("allocations")
          .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", bm._id))
          .collect()
      )
    );

    // Collect all unique category IDs and batch fetch
    const allAllocations = allAllocationsArrays.flat();
    const categoryIds = [...new Set(allAllocations.map((a) => a.categoryId))];
    const categories = await Promise.all(
      categoryIds.map((id) => ctx.db.get(id))
    );
    const categoryMap = new Map(
      categories
        .filter((c): c is Doc<"categories"> => c !== null)
        .map((c) => [c._id, c])
    );

    // Calculate monthly trends with pre-fetched data
    const monthlyTrends: MonthlyData[] = [];
    const categoryTotals = new Map<string, { name: string; color: string; total: number }>();

    budgetMonths.forEach((bm, index) => {
      const income = bm.income;
      const savingsAmount = income * bm.savingsRate;
      const allocations = allAllocationsArrays[index];

      let nonSavingsTotal = 0;
      for (const allocation of allocations) {
        const category = categoryMap.get(allocation.categoryId);
        if (category && !category.isSavings) {
          nonSavingsTotal += allocation.amount;

          // Track category totals
          const existing = categoryTotals.get(category._id);
          if (existing) {
            existing.total += allocation.amount;
          } else {
            categoryTotals.set(category._id, {
              name: category.name,
              color: category.color,
              total: allocation.amount,
            });
          }
        }
      }

      const totalAllocated = savingsAmount + nonSavingsTotal;

      monthlyTrends.push({
        year: bm.year,
        month: bm.month,
        income,
        savingsRate: bm.savingsRate,
        savingsAmount,
        totalAllocated,
        adjustmentReason: bm.adjustmentReason ?? null,
      });
    });

    // Calculate averages
    const totalMonths = monthlyTrends.length;
    const averageIncome =
      monthlyTrends.reduce((sum, m) => sum + m.income, 0) / totalMonths;
    const averageSavingsRate =
      monthlyTrends.reduce((sum, m) => sum + m.savingsRate, 0) / totalMonths;
    const averageSavingsAmount =
      monthlyTrends.reduce((sum, m) => sum + m.savingsAmount, 0) / totalMonths;
    const totalSaved = monthlyTrends.reduce((sum, m) => sum + m.savingsAmount, 0);

    // Get months with low savings
    const monthsWithLowSavings = monthlyTrends.filter(
      (m) => m.savingsRate < MIN_SAVINGS_RATE
    );

    // Get top 5 categories by total
    const topCategories = Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      averageIncome,
      averageSavingsRate,
      averageSavingsAmount,
      totalSaved,
      totalMonths,
      monthsWithLowSavings,
      topCategories,
      monthlyTrends,
    };
  },
});

// Get budget history (for history page)
export const getBudgetHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const budgetMonths = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort by year and month descending
    budgetMonths.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // Batch fetch all allocations for all budget months in parallel
    const allAllocationsArrays = await Promise.all(
      budgetMonths.map((bm) =>
        ctx.db
          .query("allocations")
          .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", bm._id))
          .collect()
      )
    );

    // Collect all unique category IDs and batch fetch
    const allAllocations = allAllocationsArrays.flat();
    const categoryIds = [...new Set(allAllocations.map((a) => a.categoryId))];
    const categories = await Promise.all(
      categoryIds.map((id) => ctx.db.get(id))
    );
    const categoryMap = new Map(
      categories
        .filter((c): c is Doc<"categories"> => c !== null)
        .map((c) => [c._id, c])
    );

    // Build result with pre-fetched data
    const result = budgetMonths.map((bm, index) => {
      const income = bm.income;
      const savingsAmount = income * bm.savingsRate;
      const allocations = allAllocationsArrays[index];

      let nonSavingsTotal = 0;
      for (const allocation of allocations) {
        const category = categoryMap.get(allocation.categoryId);
        if (category && !category.isSavings) {
          nonSavingsTotal += allocation.amount;
        }
      }

      return {
        year: bm.year,
        month: bm.month,
        income,
        savingsRate: bm.savingsRate,
        savingsAmount,
        totalAllocated: savingsAmount + nonSavingsTotal,
        adjustmentReason: bm.adjustmentReason ?? null,
      };
    });

    return result;
  },
});
