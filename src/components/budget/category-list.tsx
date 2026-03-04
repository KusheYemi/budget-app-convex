"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryRow } from "./category-row";
import { AddCategoryDialog } from "./add-category-dialog";
import type { CurrencyCode } from "@/lib/validators";
import { Plus, Layers } from "lucide-react";

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
}: CategoryListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  function getAllocationAmount(categoryId: string): number {
    return allocationAmounts.get(categoryId) ?? 0;
  }

  const savingsAmount = totalIncome * savingsRate;

  const categoriesWithAllocations = categories.filter(
    (c) => c.isSavings || allocationAmounts.has(c.id)
  );

  const sortedCategories = [...categoriesWithAllocations].sort((a, b) => {
    if (a.isSavings) return -1;
    if (b.isSavings) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <Card className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-normal">Categories</h2>
            <p className="text-xs text-muted-foreground">
              {sortedCategories.length} active this month
            </p>
          </div>
        </div>
        {!isReadOnly && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="rounded-xl gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Category</span>
            </Button>
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <AnimatePresence mode="popLayout">
          {sortedCategories.length > 0 ? (
            <div className="divide-y divide-border/30">
              {sortedCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <CategoryRow
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
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 px-6 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Layers className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">
                No categories yet
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Add your first category to start budgeting
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <AddCategoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        budgetMonthId={budgetMonthId}
      />
    </Card>
  );
}
