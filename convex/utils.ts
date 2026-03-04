import { Doc } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

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

/**
 * Batch-fetches categories for a set of allocations and joins them.
 * Uses a Map for O(1) lookups to avoid N+1 queries.
 */
export async function getAllocationsWithCategories(
  ctx: QueryCtx,
  allocations: Doc<"allocations">[]
) {
  const categoryIds = [...new Set(allocations.map((a) => a.categoryId))];
  const categories = await Promise.all(categoryIds.map((id) => ctx.db.get(id)));
  const categoryMap = new Map(
    categories
      .filter((c): c is Doc<"categories"> => c !== null)
      .map((c) => [c._id, c])
  );
  return allocations.map((allocation) => ({
    ...allocation,
    category: categoryMap.get(allocation.categoryId) ?? null,
  }));
}
