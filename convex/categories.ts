import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

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

    const category = await ctx.db.get(categoryId);
    return { success: true, category };
  },
});

// Update a category
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    if (category.isSavings && args.name) {
      throw new Error("Cannot rename the Savings category");
    }

    const updates: { name?: string; color?: string } = {};

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length === 0) {
        throw new Error("Category name is required");
      }
      if (name.length > 50) {
        throw new Error("Category name must be 50 characters or less");
      }

      // Check for duplicate name
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_user_name", (q) => q.eq("userId", userId).eq("name", name))
        .first();

      if (existing && existing._id !== args.categoryId) {
        throw new Error("A category with this name already exists");
      }

      updates.name = name;
    }

    if (args.color !== undefined) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(args.color)) {
        throw new Error("Please enter a valid hex color");
      }
      updates.color = args.color;
    }

    await ctx.db.patch(args.categoryId, updates);
    return { success: true };
  },
});

// Delete a category
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found");
    }

    if (category.isSavings) {
      throw new Error("Cannot delete the Savings category");
    }

    // Delete all allocations for this category
    const allocations = await ctx.db
      .query("allocations")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const allocation of allocations) {
      await ctx.db.delete(allocation._id);
    }

    // Delete the category
    await ctx.db.delete(args.categoryId);

    return { success: true };
  },
});

// Reorder categories
export const reorderCategories = mutation({
  args: {
    categoryIds: v.array(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.categoryIds.length === 0 || args.categoryIds.length > 100) {
      throw new Error("Invalid category order");
    }

    // Verify all categories belong to user
    for (let i = 0; i < args.categoryIds.length; i++) {
      const category = await ctx.db.get(args.categoryIds[i]);
      if (!category || category.userId !== userId) {
        throw new Error("Category not found");
      }

      await ctx.db.patch(args.categoryIds[i], { sortOrder: i });
    }

    return { success: true };
  },
});
