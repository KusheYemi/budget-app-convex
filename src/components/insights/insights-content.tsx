"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Sparkles,
  AlertCircle,
  History as HistoryIcon,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardHeaderIcon,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LazyIncomeSavingsLineChart,
  LazyAllocationBarChart,
} from "@/components/charts/lazy";
import {
  formatCurrency,
  formatPercentage,
  formatMonth,
  getCurrentMonth,
  MIN_SAVINGS_RATE,
  MIN_SAVINGS_RATE_PERCENT,
  cn,
} from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";
import type { InsightsData } from "@/lib/insights-types";
import { AIAnalysisCard } from "@/components/insights/ai-analysis-card";

interface InsightsContentProps {
  data: InsightsData;
  currency: CurrencyCode;
  email: string;
}

interface KeyStat {
  label: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: "neutral" | "savings" | "success";
  accent: string;
  bg: string;
}

export function InsightsContent({
  data,
  currency,
  email,
}: InsightsContentProps) {
  const { year, month } = getCurrentMonth();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  const reversedHistory = [...data.monthlyTrends].reverse();
  const totalPages = Math.ceil(reversedHistory.length / itemsPerPage);
  const paginatedHistory = reversedHistory.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const stats: KeyStat[] = [
    {
      label: "Average Income",
      value: formatCurrency(data.averageIncome, currency),
      Icon: Wallet,
      tone: "neutral",
      accent: "border-l-foreground/20",
      bg: "bg-secondary/50",
    },
    {
      label: "Average Savings Rate",
      value: formatPercentage(data.averageSavingsRate * 100, 1),
      Icon: TrendingUp,
      tone: "savings",
      accent: "border-l-savings",
      bg: "bg-savings/8",
    },
    {
      label: "Avg Monthly Savings",
      value: formatCurrency(data.averageSavingsAmount, currency),
      Icon: PiggyBank,
      tone: "savings",
      accent: "border-l-savings",
      bg: "bg-savings/8",
    },
    {
      label: "Total Saved",
      value: formatCurrency(data.totalSaved, currency),
      Icon: Sparkles,
      tone: "success",
      accent: "border-l-success",
      bg: "bg-success/8",
    },
  ];

  return (
    <div className="min-h-screen bg-background grain">
      <Header email={email} year={year} month={month} />

      <main className="container py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="page-title text-3xl sm:text-4xl text-foreground">
            Insights &amp; <span className="text-primary italic">Statistics</span>
          </h1>
          <p className="text-muted-foreground">
            Overview of your budgeting history across {data.totalMonths} month
            {data.totalMonths !== 1 ? "s" : ""}.
          </p>
        </motion.div>

        {/* Key stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-savings/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 p-4 sm:p-6">
              {stats.map((stat, index) => {
                const Icon = stat.Icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
                    className={cn(
                      "relative p-4 rounded-2xl border-l-4 transition-all duration-300 hover:scale-[1.02]",
                      stat.bg,
                      stat.accent
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          stat.tone === "savings" && "text-savings",
                          stat.tone === "success" && "text-success",
                          stat.tone === "neutral" && "text-muted-foreground"
                        )}
                      />
                    </div>
                    <p
                      className={cn(
                        "text-xl xs:text-2xl sm:text-3xl font-semibold tracking-tight font-mono tabular-nums truncate",
                        stat.tone === "savings" && "text-savings",
                        stat.tone === "success" && "text-success",
                        stat.tone === "neutral" && "text-foreground"
                      )}
                      title={stat.value}
                    >
                      {stat.value}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 sm:gap-6"
        >
          <LazyIncomeSavingsLineChart
            data={data.monthlyTrends}
            currency={currency}
          />
          <LazyAllocationBarChart
            data={data.topCategories.map((c) => ({
              name: c.name,
              value: c.total,
              color: c.color,
            }))}
            currency={currency}
          />
        </motion.div>

        {/* Low Savings Months */}
        {data.monthsWithLowSavings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardHeaderIcon tone="warning">
                    <AlertCircle className="w-5 h-5" />
                  </CardHeaderIcon>
                  <div className="flex-1">
                    <CardTitle>
                      Months below {MIN_SAVINGS_RATE_PERCENT}%
                    </CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {data.monthsWithLowSavings.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.monthsWithLowSavings.map((m) => (
                    <div
                      key={`${m.year}-${m.month}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-warning/10 border border-warning/20 rounded-xl"
                    >
                      <div>
                        <p className="font-medium">
                          {formatMonth(m.year, m.month)}
                        </p>
                        <p className="text-sm text-muted-foreground tabular-nums">
                          Savings rate: {formatPercentage(m.savingsRate * 100, 1)}
                        </p>
                      </div>
                      {m.adjustmentReason && (
                        <div className="sm:text-right max-w-md">
                          <p className="text-xs text-muted-foreground">Reason:</p>
                          <p className="text-sm">{m.adjustmentReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Monthly History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardHeaderIcon tone="primary">
                  <HistoryIcon className="w-5 h-5" />
                </CardHeaderIcon>
                <CardTitle className="flex-1">Monthly History</CardTitle>
                {totalPages > 1 && (
                  <span className="text-sm font-normal text-muted-foreground tabular-nums">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile: Cards */}
              <div className="sm:hidden space-y-3">
                {paginatedHistory.map((m) => (
                  <div
                    key={`mobile-${m.year}-${m.month}`}
                    className="p-3 border border-border/50 rounded-xl space-y-2 bg-background/50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {formatMonth(m.year, m.month)}
                      </p>
                      <span
                        className={cn(
                          "text-sm font-medium tabular-nums",
                          m.savingsRate < MIN_SAVINGS_RATE
                            ? "text-warning"
                            : "text-savings"
                        )}
                      >
                        {formatPercentage(m.savingsRate * 100, 0)} saved
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Income</p>
                        <p className="font-medium font-mono tabular-nums">
                          {formatCurrency(m.income, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Savings</p>
                        <p className="font-medium text-savings font-mono tabular-nums">
                          {formatCurrency(m.savingsAmount, currency)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs">
                          Total Allocated
                        </p>
                        <p className="font-medium font-mono tabular-nums">
                          {formatCurrency(m.totalAllocated, currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="text-left py-3 px-2 font-medium">
                        Month
                      </th>
                      <th scope="col" className="text-right py-3 px-2 font-medium">
                        Income
                      </th>
                      <th scope="col" className="text-right py-3 px-2 font-medium">
                        Savings Rate
                      </th>
                      <th scope="col" className="text-right py-3 px-2 font-medium">
                        Savings
                      </th>
                      <th scope="col" className="text-right py-3 px-2 font-medium">
                        Total Allocated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((m) => (
                      <tr
                        key={`desktop-${m.year}-${m.month}`}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-2 font-medium">
                          {formatMonth(m.year, m.month)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums">
                          {formatCurrency(m.income, currency)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums">
                          <span
                            className={
                              m.savingsRate < MIN_SAVINGS_RATE
                                ? "text-warning"
                                : "text-savings"
                            }
                          >
                            {formatPercentage(m.savingsRate * 100, 0)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-savings font-mono tabular-nums">
                          {formatCurrency(m.savingsAmount, currency)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums">
                          {formatCurrency(m.totalAllocated, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2 tabular-nums">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <AIAnalysisCard data={data} currency={currency} />
        </motion.div>
      </main>
    </div>
  );
}
