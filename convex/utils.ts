import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { MAX_FUTURE_MONTHS } from "./constants";

/** Returns the current year and 1-indexed month. */
export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Descending comparator for objects with year/month fields. */
export function byMonthDesc(
  a: { year: number; month: number },
  b: { year: number; month: number }
): number {
  if (a.year !== b.year) return b.year - a.year;
  return b.month - a.month;
}

/** Ascending comparator for objects with year/month fields. */
export function byMonthAsc(
  a: { year: number; month: number },
  b: { year: number; month: number }
): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

/** Check if a month is editable (current or future within limit). */
export function isEditableMonth(year: number, month: number): boolean {
  const { year: currentYear, month: currentMonth } = getCurrentMonth();

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  const monthsAhead = (year - currentYear) * 12 + (month - currentMonth);
  return monthsAhead <= MAX_FUTURE_MONTHS;
}

/** Normalize an email address (trim + lowercase). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Batch-fetches categories by their IDs and returns a Map for O(1) lookups.
 * Deduplicates IDs before fetching.
 */
export async function buildCategoryMap(
  ctx: QueryCtx,
  categoryIds: Id<"categories">[]
): Promise<Map<Id<"categories">, Doc<"categories">>> {
  const uniqueIds = [...new Set(categoryIds)];
  const categories = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));
  return new Map(
    categories
      .filter((c): c is Doc<"categories"> => c !== null)
      .map((c) => [c._id, c])
  );
}

/**
 * Batch-fetches categories for a set of allocations and joins them.
 * Uses a Map for O(1) lookups to avoid N+1 queries.
 */
export async function getAllocationsWithCategories(
  ctx: QueryCtx,
  allocations: Doc<"allocations">[]
) {
  const categoryMap = await buildCategoryMap(
    ctx,
    allocations.map((a) => a.categoryId)
  );
  return allocations.map((allocation) => ({
    ...allocation,
    category: categoryMap.get(allocation.categoryId) ?? null,
  }));
}

/**
 * Batch-fetches allocations for multiple budget months and builds a
 * category lookup map. Shared by getInsightsData and getBudgetHistory.
 */
export async function fetchAllocationsWithCategoryMap(
  ctx: QueryCtx,
  budgetMonths: Doc<"budgetMonths">[]
) {
  const allAllocationsArrays = await Promise.all(
    budgetMonths.map((bm) =>
      ctx.db
        .query("allocations")
        .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", bm._id))
        .collect()
    )
  );

  const allAllocations = allAllocationsArrays.flat();
  const categoryMap = await buildCategoryMap(
    ctx,
    allAllocations.map((a) => a.categoryId)
  );

  return { allAllocationsArrays, categoryMap };
}

/** Sum non-savings allocation amounts using a pre-built category map. */
export function sumNonSavingsAllocations(
  allocations: Doc<"allocations">[],
  categoryMap: Map<Id<"categories">, Doc<"categories">>
): number {
  let total = 0;
  for (const allocation of allocations) {
    const category = categoryMap.get(allocation.categoryId);
    if (category && !category.isSavings) {
      total += allocation.amount;
    }
  }
  return total;
}

/**
 * Fetch allocations for a budget month, join with categories, and sort by sortOrder.
 * Shared by getBudgetMonth and getOrCreateBudgetMonth.
 */
export async function getSortedAllocationsWithCategories(
  ctx: QueryCtx,
  budgetMonthId: Id<"budgetMonths">
) {
  const allocations = await ctx.db
    .query("allocations")
    .withIndex("by_budgetMonth", (q) => q.eq("budgetMonthId", budgetMonthId))
    .collect();

  const allocationsWithCategories = await getAllocationsWithCategories(ctx, allocations);

  allocationsWithCategories.sort((a, b) => {
    const aOrder = a.category?.sortOrder ?? 0;
    const bOrder = b.category?.sortOrder ?? 0;
    return aOrder - bOrder;
  });

  return allocationsWithCategories;
}

/** Verify a budget month exists and belongs to the given user. */
export async function requireOwnedBudgetMonth(
  ctx: MutationCtx,
  budgetMonthId: Id<"budgetMonths">,
  userId: Id<"users">
): Promise<Doc<"budgetMonths">> {
  const budgetMonth = await ctx.db.get(budgetMonthId);
  if (!budgetMonth || budgetMonth.userId !== userId) {
    throw new Error("Budget month not found");
  }
  return budgetMonth;
}

/** Verify a category exists, belongs to the user, and is not savings. */
export async function requireOwnedNonSavingsCategory(
  ctx: MutationCtx,
  categoryId: Id<"categories">,
  userId: Id<"users">
): Promise<Doc<"categories">> {
  const category = await ctx.db.get(categoryId);
  if (!category || category.userId !== userId) {
    throw new Error("Category not found");
  }
  if (category.isSavings) {
    throw new Error("Cannot modify the Savings category");
  }
  return category;
}
