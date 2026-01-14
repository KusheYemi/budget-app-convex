import { mutation } from "./_generated/server";
import { v } from "convex/values";

// IMPORTANT: Delete this file after data import is complete!

// ID mapping types
type OldToNewIdMap = {
  users: Map<string, string>;
  categories: Map<string, string>;
  budgetMonths: Map<string, string>;
};

// Data structure types matching the export format
const allocationSchema = v.object({
  id: v.string(),
  budgetMonthId: v.string(),
  categoryId: v.string(),
  amount: v.number(),
  amountInCents: v.number(),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const budgetMonthSchema = v.object({
  id: v.string(),
  userId: v.string(),
  year: v.number(),
  month: v.number(),
  income: v.number(),
  incomeInCents: v.number(),
  savingsRate: v.number(),
  adjustmentReason: v.union(v.string(), v.null()),
  createdAt: v.string(),
  updatedAt: v.string(),
  allocations: v.array(allocationSchema),
});

const categorySchema = v.object({
  id: v.string(),
  userId: v.string(),
  name: v.string(),
  color: v.string(),
  isSavings: v.boolean(),
  isDefault: v.boolean(),
  sortOrder: v.number(),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const userSchema = v.object({
  id: v.string(),
  email: v.string(),
  currency: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  budgetMonths: v.array(budgetMonthSchema),
  categories: v.array(categorySchema),
});

export const importData = mutation({
  args: {
    users: v.array(userSchema),
  },
  handler: async (ctx, args) => {
    const idMap: OldToNewIdMap = {
      users: new Map(),
      categories: new Map(),
      budgetMonths: new Map(),
    };

    const results = {
      users: 0,
      categories: 0,
      budgetMonths: 0,
      allocations: 0,
      errors: [] as string[],
    };

    for (const userData of args.users) {
      try {
        // Check if user already exists by email
        const existingUser = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", userData.email))
          .first();

        let newUserId: string;

        if (existingUser) {
          // Update existing user
          newUserId = existingUser._id;
          await ctx.db.patch(existingUser._id, {
            currency: userData.currency,
          });
        } else {
          // Create new user (without auth - they'll need to sign up)
          newUserId = await ctx.db.insert("users", {
            email: userData.email,
            currency: userData.currency,
          });
        }

        idMap.users.set(userData.id, newUserId);
        results.users++;

        // Import categories for this user
        for (const category of userData.categories) {
          try {
            // Check if category already exists
            const existingCategory = await ctx.db
              .query("categories")
              .withIndex("by_user", (q) => q.eq("userId", newUserId as any))
              .filter((q) => q.eq(q.field("name"), category.name))
              .first();

            let newCategoryId: string;

            if (existingCategory) {
              newCategoryId = existingCategory._id;
              // Update existing category
              await ctx.db.patch(existingCategory._id, {
                color: category.color,
                isSavings: category.isSavings,
                isDefault: category.isDefault,
                sortOrder: category.sortOrder,
              });
            } else {
              // Create new category
              newCategoryId = await ctx.db.insert("categories", {
                userId: newUserId as any,
                name: category.name,
                color: category.color,
                isSavings: category.isSavings,
                isDefault: category.isDefault,
                sortOrder: category.sortOrder,
              });
            }

            idMap.categories.set(category.id, newCategoryId);
            results.categories++;
          } catch (err) {
            results.errors.push(`Category ${category.name}: ${err}`);
          }
        }

        // Import budget months for this user
        for (const budgetMonth of userData.budgetMonths) {
          try {
            // Check if budget month already exists
            const existingBudgetMonth = await ctx.db
              .query("budgetMonths")
              .withIndex("by_user_year_month", (q) =>
                q.eq("userId", newUserId as any)
                  .eq("year", budgetMonth.year)
                  .eq("month", budgetMonth.month)
              )
              .first();

            let newBudgetMonthId: string;

            if (existingBudgetMonth) {
              newBudgetMonthId = existingBudgetMonth._id;
              // Update existing budget month
              await ctx.db.patch(existingBudgetMonth._id, {
                income: budgetMonth.income,
                savingsRate: budgetMonth.savingsRate,
                adjustmentReason: budgetMonth.adjustmentReason ?? undefined,
              });
            } else {
              // Create new budget month
              newBudgetMonthId = await ctx.db.insert("budgetMonths", {
                userId: newUserId as any,
                year: budgetMonth.year,
                month: budgetMonth.month,
                income: budgetMonth.income,
                savingsRate: budgetMonth.savingsRate,
                adjustmentReason: budgetMonth.adjustmentReason ?? undefined,
              });
            }

            idMap.budgetMonths.set(budgetMonth.id, newBudgetMonthId);
            results.budgetMonths++;

            // Import allocations for this budget month
            for (const allocation of budgetMonth.allocations) {
              try {
                const newCategoryId = idMap.categories.get(allocation.categoryId);
                if (!newCategoryId) {
                  results.errors.push(
                    `Allocation: Category ${allocation.categoryId} not found in map`
                  );
                  continue;
                }

                // Check if allocation already exists
                const existingAllocation = await ctx.db
                  .query("allocations")
                  .withIndex("by_budgetMonth_category", (q) =>
                    q.eq("budgetMonthId", newBudgetMonthId as any)
                     .eq("categoryId", newCategoryId as any)
                  )
                  .first();

                if (existingAllocation) {
                  // Update existing allocation
                  await ctx.db.patch(existingAllocation._id, {
                    amount: allocation.amount,
                  });
                } else {
                  // Create new allocation
                  await ctx.db.insert("allocations", {
                    budgetMonthId: newBudgetMonthId as any,
                    categoryId: newCategoryId as any,
                    amount: allocation.amount,
                  });
                }

                results.allocations++;
              } catch (err) {
                results.errors.push(`Allocation: ${err}`);
              }
            }
          } catch (err) {
            results.errors.push(`Budget month ${budgetMonth.year}-${budgetMonth.month}: ${err}`);
          }
        }
      } catch (err) {
        results.errors.push(`User ${userData.email}: ${err}`);
      }
    }

    return results;
  },
});
