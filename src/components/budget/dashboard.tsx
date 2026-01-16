"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { SummaryCard } from "./summary-card";
import { CategoryList } from "./category-list";
import { EditIncomeDialog } from "./edit-income-dialog";
import { SavingsRateDialog } from "./savings-rate-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationPieChart } from "@/components/charts/allocation-pie-chart";
import { AllocationBarChart } from "@/components/charts/allocation-bar-chart";
import { toast } from "sonner";
import {
  getCurrentMonth,
  isCurrentMonth,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";

interface DashboardProps {
  initialYear?: number;
  initialMonth?: number;
  ensureCurrentMonth?: boolean;
}

export function Dashboard({
  initialYear,
  initialMonth,
  ensureCurrentMonth,
}: DashboardProps) {
  const current = getCurrentMonth();
  const year = initialYear ?? current.year;
  const month = initialMonth ?? current.month;
  const isReadOnly = !isCurrentMonth(year, month);

  // Convex queries
  const user = useQuery(api.users.getCurrentUser);
  const budgetMonth = useQuery(api.budgets.getBudgetMonth, { year, month });
  const categories = useQuery(api.categories.getCategories);

  // Convex mutations
  const getOrCreateBudgetMonth = useMutation(api.budgets.getOrCreateBudgetMonth);
  const copyAllocations = useMutation(api.allocations.copyAllocationsFromPreviousMonthAuto);

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showSavingsDialog, setShowSavingsDialog] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isCreatingBudgetMonth, setIsCreatingBudgetMonth] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [hasAttemptedCreate, setHasAttemptedCreate] = useState(false);

  // Optimistic allocations for instant UI updates
  const [optimisticAllocations, setOptimisticAllocations] = useState<
    Array<{ categoryId: string; amount: number; category: { isSavings: boolean; id: string; name: string; color: string } }>
  >([]);

  // Sync optimistic allocations with server data
  useEffect(() => {
    if (budgetMonth?.allocations) {
      setOptimisticAllocations(
        budgetMonth.allocations.map((a: { categoryId: string; amount: number; category: { isSavings: boolean; _id: string; name: string; color: string } | null }) => ({
          categoryId: a.categoryId,
          amount: a.amount,
          category: a.category ? {
            isSavings: a.category.isSavings,
            id: a.category._id,
            name: a.category.name,
            color: a.category.color,
          } : { isSavings: false, id: a.categoryId, name: "", color: "#6366f1" },
        }))
      );
    }
  }, [budgetMonth?.allocations]);

  const shouldEnsureBudgetMonth = Boolean(
    ensureCurrentMonth && !isReadOnly && user
  );

  useEffect(() => {
    if (
      !shouldEnsureBudgetMonth ||
      budgetMonth !== null ||
      isCreatingBudgetMonth ||
      createError ||
      hasAttemptedCreate
    ) {
      return;
    }

    let cancelled = false;
    setIsCreatingBudgetMonth(true);
    setHasAttemptedCreate(true);
    setCreateError(null);

    getOrCreateBudgetMonth({ year, month })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Unable to create budget month.";
        setCreateError(message);
        toast.error("Failed to create budget month", { description: message });
      })
      .finally(() => {
        if (!cancelled) {
          setIsCreatingBudgetMonth(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    shouldEnsureBudgetMonth,
    budgetMonth,
    isCreatingBudgetMonth,
    createError,
    hasAttemptedCreate,
    getOrCreateBudgetMonth,
    year,
    month,
  ]);

  // Optimistic update for allocation
  const handleOptimisticAllocationUpdate = useCallback((
    categoryId: string,
    newAmount: number
  ) => {
    const category = categories?.find((c) => c._id === categoryId);
    if (!category || !budgetMonth) return;

    setOptimisticAllocations((prev) => {
      const existingIndex = prev.findIndex((a) => a.categoryId === categoryId);

      if (newAmount === 0 && existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      } else if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          amount: newAmount,
        };
        return updated;
      } else if (newAmount > 0) {
        return [
          ...prev,
          {
            categoryId,
            amount: newAmount,
            category: {
              isSavings: category.isSavings,
              id: category._id,
              name: category.name,
              color: category.color,
            },
          },
        ];
      }
      return prev;
    });
  }, [categories, budgetMonth]);

  async function handleCopyPreviousMonth() {
    if (!budgetMonth) return;
    setIsCopying(true);
    try {
      await copyAllocations({ budgetMonthId: budgetMonth._id });
      toast.success("Copied previous month allocations");
    } catch (err) {
      toast.error("Copy failed", { description: err instanceof Error ? err.message : "Unknown error" });
    }
    setIsCopying(false);
  }

  const isWaitingForBudgetMonth =
    shouldEnsureBudgetMonth && budgetMonth === null && !createError;

  // Loading state
  const loading =
    user === undefined ||
    budgetMonth === undefined ||
    categories === undefined ||
    isCreatingBudgetMonth ||
    isWaitingForBudgetMonth;
  const currency = (user?.currency as CurrencyCode) ?? "SLE";
  const email = user?.email ?? "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={email} year={year} month={month} />
        <main className="container py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your budget...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!budgetMonth) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={email} year={year} month={month} />
        <main className="container py-6">
          <p className="text-center text-muted-foreground">
            No budget data found for this month.
          </p>
        </main>
      </div>
    );
  }

  const income = budgetMonth.income;
  const savingsRate = budgetMonth.savingsRate;
  const savingsAmount = income * savingsRate;
  const totalAllocated =
    savingsAmount +
    optimisticAllocations
      .filter((a) => !a.category.isSavings)
      .reduce((sum, a) => sum + a.amount, 0);

  // Memoized transform for categories (avoids recreating on every render)
  const categoriesForList = useMemo(() =>
    categories.map((c) => ({
      id: c._id,
      name: c.name,
      color: c.color,
      isSavings: c.isSavings,
      sortOrder: c.sortOrder,
    })),
    [categories]
  );

  // O(1) lookup map for chart data (avoids O(n²) .find() calls)
  const allocationAmountMap = useMemo(() =>
    new Map(optimisticAllocations.map((a) => [a.categoryId, a.amount])),
    [optimisticAllocations]
  );

  // Memoized chart data
  const chartData = useMemo(() => [
    { name: "Savings", value: savingsAmount, color: "#6366f1" },
    ...categories
      .filter((c) => !c.isSavings)
      .map((c) => ({
        name: c.name,
        value: allocationAmountMap.get(c._id) ?? 0,
        color: c.color,
      })),
  ], [categories, savingsAmount, allocationAmountMap]);

  return (
    <div className="min-h-screen bg-background">
      <Header email={email} year={year} month={month} />

      <main className="container py-6 space-y-6">
        {/* Summary Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">Budget Overview</h1>
            {!isReadOnly && (
              <div className="grid grid-cols-3 sm:flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={() => setShowIncomeDialog(true)}
                >
                  <span className="sm:hidden">Income</span>
                  <span className="hidden sm:inline">Edit Income</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={() => setShowSavingsDialog(true)}
                >
                  <span className="sm:hidden">Savings</span>
                  <span className="hidden sm:inline">Adjust Savings</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={handleCopyPreviousMonth}
                  disabled={isCopying}
                >
                  <span className="sm:hidden">{isCopying ? "..." : "Copy"}</span>
                  <span className="hidden sm:inline">{isCopying ? "Copying..." : "Copy Last Month"}</span>
                </Button>
              </div>
            )}
          </div>

          <SummaryCard
            income={income}
            savingsRate={savingsRate}
            totalAllocated={totalAllocated}
            currency={currency}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Categories */}
          <CategoryList
            categories={categoriesForList}
            allocationAmounts={allocationAmountMap}
            budgetMonthId={budgetMonth._id}
            totalIncome={income}
            savingsRate={savingsRate}
            currency={currency}
            isReadOnly={isReadOnly}
            onAllocationUpdate={handleOptimisticAllocationUpdate}
            onRefresh={() => {}} // Convex auto-refreshes
          />

          {/* Quick Stats / Savings Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Savings Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Savings Rate</span>
                  <span className="font-medium text-savings">
                    {formatPercentage(savingsRate * 100, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Savings</span>
                  <span className="font-medium text-savings">
                    {formatCurrency(savingsAmount, currency)}
                  </span>
                </div>
                {budgetMonth.adjustmentReason && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">
                      Reason for lower savings:
                    </p>
                    <p className="text-sm bg-warning/10 p-2 rounded">
                      {budgetMonth.adjustmentReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charts - using memoized data */}
            <AllocationPieChart data={chartData} currency={currency} />

            <AllocationBarChart data={chartData} currency={currency} />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <EditIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        budgetMonthId={budgetMonth._id}
        currentIncome={income}
        currency={currency}
        onSuccess={() => {}} // Convex auto-refreshes
      />

      <SavingsRateDialog
        open={showSavingsDialog}
        onOpenChange={setShowSavingsDialog}
        budgetMonthId={budgetMonth._id}
        currentRate={savingsRate}
        currentReason={budgetMonth.adjustmentReason}
        income={income}
        currency={currency}
        onSuccess={() => {}} // Convex auto-refreshes
      />
    </div>
  );
}
