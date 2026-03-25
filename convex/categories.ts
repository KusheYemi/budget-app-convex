import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";
import { requireOwnedBudgetMonth } from "./utils";

// Get all categories for current user
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort by sortOrder
    categories.sort((a, b) => a.sortOrder - b.sortOrder);

    return categories;
  },
});

// Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
    budgetMonthId: v.optional(v.id("budgetMonths")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate name
    const name = args.name.trim();
    if (name.length === 0) {
      throw new Error("Category name is required");
    }
    if (name.length > 50) {
      throw new Error("Category name must be 50 characters or less");
    }

    // Validate color
    const color = args.color ?? "#6366f1";
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      throw new Error("Please enter a valid hex color");
    }

    // Check if category with same name exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", name))
      .first();

    if (existing) {
      throw new Error("A category with this name already exists");
    }

    if (args.budgetMonthId) {
      await requireOwnedBudgetMonth(ctx, args.budgetMonthId, userId);
    }

    // Get highest sort order
    const allCategories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const maxSortOrder = allCategories.reduce(
      (max, cat) => Math.max(max, cat.sortOrder),
      -1
    );

    const categoryId = await ctx.db.insert("categories", {
      userId,
      name,
      color,
      isSavings: false,
      isDefault: false,
      sortOrder: maxSortOrder + 1,
    });

    // Create initial allocation for the specified budget month
    if (args.budgetMonthId) {
      await ctx.db.insert("allocations", {
        budgetMonthId: args.budgetMonthId,
        categoryId,
        amount: 0,
      });
    }

    const category = await ctx.db.get(categoryId);
    return { success: true, category };
  },
});

