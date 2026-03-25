"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/layout/header";
import { SummaryCard } from "./summary-card";
import { CategoryList } from "./category-list";
import { EditIncomeDialog } from "./edit-income-dialog";
import { SavingsRateDialog } from "./savings-rate-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LazyAllocationPieChart,
  LazyAllocationBarChart,
} from "@/components/charts/lazy";
import { toast } from "sonner";
import {
  getCurrentMonth,
  isEditableMonth,
  formatCurrency,
  formatPercentage,
  getUserCurrency,
  MIN_SAVINGS_RATE,
} from "@/lib/utils";
import {
  Pencil,
  TrendingUp,
  Copy,
  Loader2,
  PiggyBank,
  AlertCircle,
  Sparkles,
} from "lucide-react";

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
  const isReadOnly = !isEditableMonth(year, month);

  const user = useQuery(api.users.getCurrentUser);
  const budgetMonth = useQuery(api.budgets.getBudgetMonth, { year, month });
  const categories = useQuery(api.categories.getCategories);

  const getOrCreateBudgetMonth = useMutation(api.budgets.getOrCreateBudgetMonth);
  const copyAllocations = useMutation(
    api.allocations.copyAllocationsFromPreviousMonthAuto
  );

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showSavingsDialog, setShowSavingsDialog] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isCreatingBudgetMonth, setIsCreatingBudgetMonth] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [hasAttemptedCreate, setHasAttemptedCreate] = useState(false);

  const [optimisticAllocations, setOptimisticAllocations] = useState<
    Array<{
      categoryId: string;
      amount: number;
      category: { isSavings: boolean; id: string; name: string; color: string };
    }>
  >([]);

  // Sync optimistic allocations with server data
  // This effect intentionally syncs React state with Convex query results
  useEffect(() => {
    if (budgetMonth?.allocations) {
      setOptimisticAllocations(
        budgetMonth.allocations.map(
          (a: {
            categoryId: string;
            amount: number;
            category: {
              isSavings: boolean;
              _id: string;
              name: string;
              color: string;
            } | null;
          }) => ({
            categoryId: a.categoryId,
            amount: a.amount,
            category: a.category
              ? {
                  isSavings: a.category.isSavings,
                  id: a.category._id,
                  name: a.category.name,
                  color: a.category.color,
                }
              : {
                  isSavings: false,
                  id: a.categoryId,
                  name: "",
                  color: "#6366f1",
                },
          })
        )
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

  const handleOptimisticAllocationUpdate = useCallback(
    (categoryId: string, newAmount: number) => {
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
    },
    [categories, budgetMonth]
  );

  async function handleCopyPreviousMonth() {
    if (!budgetMonth) return;
    setIsCopying(true);
    try {
      await copyAllocations({ budgetMonthId: budgetMonth._id });
      toast.success("Copied previous month allocations");
    } catch (err) {
      toast.error("Copy failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsCopying(false);
    }
  }

  const isWaitingForBudgetMonth =
    shouldEnsureBudgetMonth && budgetMonth === null && !createError;

  const loading =
    user === undefined ||
    budgetMonth === undefined ||
    categories === undefined ||
    isCreatingBudgetMonth ||
    isWaitingForBudgetMonth;
  const currency = getUserCurrency(user ?? {});
  const email = user?.email ?? "";

  const income = budgetMonth?.income ?? 0;
  const savingsRate = budgetMonth?.savingsRate ?? 0;
  const savingsAmount = income * savingsRate;

  const categoriesForList = useMemo(
    () =>
      (categories ?? []).map((c) => ({
        id: c._id,
        name: c.name,
        color: c.color,
        isSavings: c.isSavings,
        sortOrder: c.sortOrder,
      })),
    [categories]
  );

  const allocationAmountMap = useMemo(
    () => new Map(optimisticAllocations.map((a) => [a.categoryId, a.amount])),
    [optimisticAllocations]
  );

  const chartData = useMemo(
    () => [
      { name: "Savings", value: savingsAmount, color: "#5a9a7b" },
      ...(categories ?? [])
        .filter((c) => !c.isSavings)
        .map((c) => ({
          name: c.name,
          value: allocationAmountMap.get(c._id) ?? 0,
          color: c.color,
        })),
    ],
    [categories, savingsAmount, allocationAmountMap]
  );

  const totalAllocated = useMemo(
    () =>
      savingsAmount +
      optimisticAllocations
        .filter((a) => !a.category.isSavings)
        .reduce((sum, a) => sum + a.amount, 0),
    [savingsAmount, optimisticAllocations]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={email} year={year} month={month} />
        <main className="container py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="p-4 rounded-2xl bg-primary/10"
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Loading your budget...</p>
              <p className="text-sm text-muted-foreground">
                Preparing your financial overview
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!budgetMonth) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={email} year={year} month={month} />
        <main className="container py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="p-4 rounded-2xl bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-center text-muted-foreground">
              No budget data found for this month.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grain">
      <Header email={email} year={year} month={month} />

      <main className="container py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-foreground">
              Budget Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              {isReadOnly ? "Viewing historical data" : "Manage your monthly finances"}
            </p>
          </div>

          {!isReadOnly && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2 border-dashed"
                onClick={() => setShowIncomeDialog(true)}
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span> Income
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2 border-dashed"
                onClick={() => setShowSavingsDialog(true)}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Adjust</span> Savings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2 border-dashed"
                onClick={handleCopyPreviousMonth}
                disabled={isCopying}
              >
                {isCopying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Copy Last</span>
                <span className="sm:hidden">Copy</span>
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SummaryCard
            income={income}
            savingsRate={savingsRate}
            totalAllocated={totalAllocated}
            currency={currency}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Categories - Takes more space */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <CategoryList
              categories={categoriesForList}
              allocationAmounts={allocationAmountMap}
              budgetMonthId={budgetMonth._id}
              totalIncome={income}
              savingsRate={savingsRate}
              currency={currency}
              isReadOnly={isReadOnly}
              onAllocationUpdate={handleOptimisticAllocationUpdate}
            />
          </motion.div>

          {/* Sidebar - Savings & Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Savings Details Card */}
            <Card className="border-0 bg-gradient-to-br from-savings/10 via-savings/5 to-transparent overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-savings/20">
                    <PiggyBank className="w-5 h-5 text-savings" />
                  </div>
                  <CardTitle className="text-lg font-serif font-normal">
                    Savings Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Rate</span>
                  <span className="text-2xl font-mono font-semibold text-savings tabular-nums">
                    {formatPercentage(savingsRate * 100, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-2xl font-mono font-semibold text-savings tabular-nums">
                    {formatCurrency(savingsAmount, currency)}
                  </span>
                </div>

                <AnimatePresence>
                  {budgetMonth.adjustmentReason && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-savings/20"
                    >
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
                        <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-warning mb-1">
                            Below target rate
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {budgetMonth.adjustmentReason}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {savingsRate >= MIN_SAVINGS_RATE && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
                    <Sparkles className="w-4 h-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      On track with 20% goal
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charts */}
            <LazyAllocationPieChart data={chartData} currency={currency} />
            <LazyAllocationBarChart data={chartData} currency={currency} />
          </motion.div>
        </div>
      </main>

      {/* Dialogs */}
      <EditIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        budgetMonthId={budgetMonth._id}
        currentIncome={income}
        currency={currency}
      />

      <SavingsRateDialog
        open={showSavingsDialog}
        onOpenChange={setShowSavingsDialog}
        budgetMonthId={budgetMonth._id}
        currentRate={savingsRate}
        currentReason={budgetMonth.adjustmentReason}
        income={income}
        currency={currency}
      />
    </div>
  );
}
