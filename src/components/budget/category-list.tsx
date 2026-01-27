"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryRow } from "./category-row";
import { AddCategoryDialog } from "./add-category-dialog";
import type { CurrencyCode } from "@/lib/validators";

interface Category {
  id: string;
  name: string;
  color: string;
  isSavings: boolean;
  sortOrder: number;
}

interface CategoryListProps {
  categories: Category[];
  allocationAmounts: Map<string, number>;
  budgetMonthId: string;
  totalIncome: number;
  savingsRate: number;
  currency: CurrencyCode;
  isReadOnly: boolean;
  onAllocationUpdate?: (categoryId: string, amount: number) => void;
  onRefresh?: () => void;
}

export function CategoryList({
  categories,
  allocationAmounts,
  budgetMonthId,
  totalIncome,
  savingsRate,
  currency,
  isReadOnly,
  onAllocationUpdate,
  onRefresh,
}: CategoryListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get allocation amount for a category
  function getAllocationAmount(categoryId: string): number {
    return allocationAmounts.get(categoryId) ?? 0;
  }

  // Calculate savings amount
  const savingsAmount = totalIncome * savingsRate;

  // Filter to only show categories that have allocations for this month (or are Savings)
  const categoriesWithAllocations = categories.filter(
    (c) => c.isSavings || allocationAmounts.has(c.id)
  );

  // Sort categories: Savings first, then by sortOrder
  const sortedCategories = [...categoriesWithAllocations].sort((a, b) => {
    if (a.isSavings) return -1;
    if (b.isSavings) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Categories</CardTitle>
        {!isReadOnly && (
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Category
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedCategories.map((category) => (
          <CategoryRow
            key={category.id}
            id={category.id}
            budgetMonthId={budgetMonthId}
            name={category.name}
            color={category.color}
            amount={
              category.isSavings
                ? savingsAmount
                : getAllocationAmount(category.id)
            }
            totalIncome={totalIncome}
            currency={currency}
            isSavings={category.isSavings}
            isReadOnly={isReadOnly}
            onUpdate={onAllocationUpdate}
            onRefresh={onRefresh}
          />
        ))}

        {categories.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No categories yet. Add one to get started!
          </p>
        )}
      </CardContent>

      <AddCategoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        budgetMonthId={budgetMonthId}
        onSuccess={onRefresh}
      />
    </Card>
  );
}
