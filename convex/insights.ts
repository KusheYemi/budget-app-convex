import { query } from "./_generated/server";
import { auth } from "./auth";
import { MIN_SAVINGS_RATE } from "./constants";
import {
  byMonthAsc,
  byMonthDesc,
  fetchAllocationsWithCategoryMap,
  sumNonSavingsAllocations,
} from "./utils";

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

export const getInsightsData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

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

    budgetMonths.sort(byMonthAsc);

    const { allAllocationsArrays, categoryMap } =
      await fetchAllocationsWithCategoryMap(ctx, budgetMonths);

    const monthlyTrends: MonthlyData[] = [];
    const categoryTotals = new Map<string, { name: string; color: string; total: number }>();

    budgetMonths.forEach((bm, index) => {
      const income = bm.income;
      const savingsAmount = income * bm.savingsRate;
      const allocations = allAllocationsArrays[index];

      const nonSavingsTotal = sumNonSavingsAllocations(allocations, categoryMap);

      for (const allocation of allocations) {
        const category = categoryMap.get(allocation.categoryId);
        if (category && !category.isSavings) {
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

    const totalMonths = monthlyTrends.length;
    const averageIncome =
      monthlyTrends.reduce((sum, m) => sum + m.income, 0) / totalMonths;
    const averageSavingsRate =
      monthlyTrends.reduce((sum, m) => sum + m.savingsRate, 0) / totalMonths;
    const averageSavingsAmount =
      monthlyTrends.reduce((sum, m) => sum + m.savingsAmount, 0) / totalMonths;
    const totalSaved = monthlyTrends.reduce((sum, m) => sum + m.savingsAmount, 0);

    const monthsWithLowSavings = monthlyTrends.filter(
      (m) => m.savingsRate < MIN_SAVINGS_RATE
    );

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

export const getBudgetHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const budgetMonths = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    budgetMonths.sort(byMonthDesc);

    const { allAllocationsArrays, categoryMap } =
      await fetchAllocationsWithCategoryMap(ctx, budgetMonths);

    const result = budgetMonths.map((bm, index) => {
      const income = bm.income;
      const savingsAmount = income * bm.savingsRate;
      const nonSavingsTotal = sumNonSavingsAllocations(
        allAllocationsArrays[index],
        categoryMap
      );

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
