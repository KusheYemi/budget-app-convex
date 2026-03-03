"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  formatCurrency,
  formatPercentage,
  calculatePercentage,
} from "@/lib/utils";
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
  const usagePercentage =
    income > 0 ? Math.min(calculatePercentage(totalAllocated, income), 100) : 0;

  const stats = [
    {
      label: "Monthly Income",
      value: formatCurrency(income, currency),
      subtext: "Total earnings",
      color: "text-foreground",
      bgColor: "bg-secondary/50",
      accentColor: "border-l-foreground/20",
    },
    {
      label: "Savings",
      value: formatCurrency(savingsAmount, currency),
      subtext: `${formatPercentage(savingsRate * 100, 0)} of income`,
      color: "text-savings",
      bgColor: "bg-savings/8",
      accentColor: "border-l-savings",
    },
    {
      label: "Allocated",
      value: formatCurrency(totalAllocated, currency),
      subtext: `${formatPercentage(calculatePercentage(totalAllocated, income), 0)} budgeted`,
      color: "text-foreground",
      bgColor: "bg-primary/8",
      accentColor: "border-l-primary",
    },
    {
      label: "Remaining",
      value: `${isOverBudget ? "-" : ""}${formatCurrency(Math.abs(remaining), currency)}`,
      subtext: isOverBudget ? "Over budget" : "Available",
      color: isOverBudget ? "text-error" : "text-success",
      bgColor: isOverBudget ? "bg-error/8" : "bg-success/8",
      accentColor: isOverBudget ? "border-l-error" : "border-l-success",
    },
  ];

  return (
    <Card className="relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-savings/10 rounded-full blur-2xl" />

      <div className="relative p-4 sm:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={cn(
                "relative p-4 rounded-2xl border-l-4 transition-all duration-300 hover:scale-[1.02]",
                stat.bgColor,
                stat.accentColor
              )}
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p
                className={cn(
                  "text-xl xs:text-2xl sm:text-3xl font-semibold tracking-tight font-mono tabular-nums",
                  stat.color
                )}
              >
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6 pt-6 border-t border-border/50"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Budget Usage
              </span>
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium",
                  isOverBudget
                    ? "bg-error/10 text-error"
                    : usagePercentage > 80
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                )}
              >
                {isOverBudget
                  ? "Over"
                  : usagePercentage > 80
                    ? "High"
                    : "Good"}
              </span>
            </div>
            <span
              className={cn(
                "text-lg font-mono font-semibold tabular-nums",
                isOverBudget ? "text-error" : "text-foreground"
              )}
            >
              {formatPercentage(calculatePercentage(totalAllocated, income), 1)}
            </span>
          </div>

          {/* Custom Progress Bar */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            {/* Background segments */}
            <div className="absolute inset-0 flex">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-background/20 last:border-r-0"
                />
              ))}
            </div>

            {/* Progress fill */}
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                isOverBudget
                  ? "bg-gradient-to-r from-error to-error/80"
                  : "bg-gradient-to-r from-primary to-primary/80"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            />

            {/* Glow effect */}
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full blur-sm",
                isOverBudget ? "bg-error/50" : "bg-primary/50"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>

          {/* Markers */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-warning">80%</span>
            <span>100%</span>
          </div>
        </motion.div>
      </div>
    </Card>
  );
}
