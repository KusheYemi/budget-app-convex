"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercentage, calculatePercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";

interface SummaryCardProps {
  income: number;
  savingsRate: number;
  totalAllocated: number;
  currency: CurrencyCode;
}

export function SummaryCard({
  income,
  savingsRate,
  totalAllocated,
  currency,
}: SummaryCardProps) {
  const savingsAmount = income * savingsRate;
  const remaining = income - totalAllocated;
  const isOverBudget = remaining < 0;
  const usagePercentage = income > 0 ? Math.min(calculatePercentage(totalAllocated, income), 100) : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Income */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Monthly Income</p>
            <p className="text-2xl font-bold">{formatCurrency(income, currency)}</p>
          </div>

          {/* Savings */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Savings</p>
            <p className="text-2xl font-bold text-savings">
              {formatCurrency(savingsAmount, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(savingsRate * 100, 0)} of income
            </p>
          </div>

          {/* Allocated */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Allocated</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAllocated, currency)}</p>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(calculatePercentage(totalAllocated, income), 1)} of income
            </p>
          </div>

          {/* Remaining */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p
              className={cn(
                "text-2xl font-bold",
                isOverBudget ? "text-destructive" : "text-success"
              )}
            >
              {isOverBudget ? "-" : ""}
              {formatCurrency(Math.abs(remaining), currency)}
            </p>
            {isOverBudget && (
              <p className="text-xs text-destructive">Over budget!</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Usage</span>
            <span
              className={cn(
                "font-medium",
                isOverBudget ? "text-destructive" : "text-foreground"
              )}
            >
              {formatPercentage(calculatePercentage(totalAllocated, income), 1)}
            </span>
          </div>
          <Progress
            value={usagePercentage}
            className={cn(
              "h-2",
              isOverBudget && "[&>div]:bg-destructive"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
