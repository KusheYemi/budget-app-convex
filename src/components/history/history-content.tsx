"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatMonth,
  formatPercentage,
  getCurrentMonth,
  MIN_SAVINGS_RATE,
  MIN_SAVINGS_RATE_PERCENT,
} from "@/lib/utils";
import type { HistoryMonth } from "@/app/actions/history";
import type { CurrencyCode } from "@/lib/validators";

interface HistoryContentProps {
  months: HistoryMonth[];
  currency: CurrencyCode;
  email: string;
}

type StatusFilter = "all" | "below" | "has-reason";
type SortOrder = "desc" | "asc";

function monthSortKey(year: number, month: number) {
  return year * 12 + month;
}

export function HistoryContent({
  months,
  currency,
  email,
}: HistoryContentProps) {
  const current = getCurrentMonth();
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const years = useMemo(() => {
    const uniqueYears = new Set(months.map((m) => m.year));
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [months]);

  const filteredMonths = useMemo(() => {
    const query = search.trim().toLowerCase();
    return months.filter((m) => {
      if (yearFilter !== "all" && m.year !== Number(yearFilter)) return false;
      if (statusFilter === "below" && m.savingsRate >= MIN_SAVINGS_RATE) {
        return false;
      }
      if (statusFilter === "has-reason" && !m.adjustmentReason) return false;

      if (query) {
        const label = formatMonth(m.year, m.month).toLowerCase();
        const numeric = `${m.year}-${String(m.month).padStart(2, "0")}`;
        if (!label.includes(query) && !numeric.includes(query)) return false;
      }

      return true;
    });
  }, [months, search, yearFilter, statusFilter]);

  const sortedMonths = useMemo(() => {
    const sorted = [...filteredMonths];
    sorted.sort((a, b) => {
      const aKey = monthSortKey(a.year, a.month);
      const bKey = monthSortKey(b.year, b.month);
      return sortOrder === "asc" ? aKey - bKey : bKey - aKey;
    });
    return sorted;
  }, [filteredMonths, sortOrder]);

  const hasFilters =
    search.trim().length > 0 ||
    yearFilter !== "all" ||
    statusFilter !== "all" ||
    sortOrder !== "desc";

  function clearFilters() {
    setSearch("");
    setYearFilter("all");
    setStatusFilter("all");
    setSortOrder("desc");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={email} year={current.year} month={current.month} />

      <main className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">Budget History</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Search and filter all your months, including older records beyond
            the last 12 months.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Filters</span>
              <Badge variant="secondary">
                {sortedMonths.length} of {months.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Search</p>
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Month or year (e.g., March 2024)"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Year</p>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All months</SelectItem>
                    <SelectItem value="below">
                      Below {MIN_SAVINGS_RATE_PERCENT}%
                    </SelectItem>
                    <SelectItem value="has-reason">
                      Has savings note
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sort</p>
                <Select
                  value={sortOrder}
                  onValueChange={(value) =>
                    setSortOrder(value as SortOrder)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Newest first" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest first</SelectItem>
                    <SelectItem value="asc">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasFilters && (
              <div className="flex items-center justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Months</CardTitle>
          </CardHeader>
          <CardContent>
            {months.length === 0 && (
              <div className="py-10 text-center text-muted-foreground">
                No history yet. Your monthly budgets will appear here once
                created.
              </div>
            )}

            {months.length > 0 && sortedMonths.length === 0 && (
              <div className="py-10 text-center text-muted-foreground">
                No months match your filters.
              </div>
            )}

            {sortedMonths.length > 0 && (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {sortedMonths.map((m) => {
                    const isCurrent =
                      m.year === current.year && m.month === current.month;
                    const isBelow = m.savingsRate < MIN_SAVINGS_RATE;
                    const href = isCurrent
                      ? "/dashboard"
                      : `/budget/${m.year}/${m.month}`;
                    return (
                      <div
                        key={`mobile-${m.year}-${m.month}`}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {formatMonth(m.year, m.month)}
                            </p>
                            {isCurrent && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                          </div>
                          <Badge
                            variant={isBelow ? "destructive" : "secondary"}
                          >
                            {isBelow
                              ? `Below ${MIN_SAVINGS_RATE_PERCENT}%`
                              : "On track"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Income
                            </p>
                            <p className="font-medium">
                              {formatCurrency(m.income, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Savings
                            </p>
                            <p className="font-medium text-savings">
                              {formatCurrency(m.savingsAmount, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Savings Rate
                            </p>
                            <p className="font-medium">
                              {formatPercentage(m.savingsRate * 100, 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Total Allocated
                            </p>
                            <p className="font-medium">
                              {formatCurrency(m.totalAllocated, currency)}
                            </p>
                          </div>
                        </div>

                        {m.adjustmentReason && (
                          <div className="text-sm">
                            <p className="text-xs text-muted-foreground">
                              Savings note
                            </p>
                            <p>{m.adjustmentReason}</p>
                          </div>
                        )}

                        <Button asChild variant="outline" size="sm">
                          <Link href={href}>View month</Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Month</th>
                        <th className="text-right py-3 px-2">Income</th>
                        <th className="text-right py-3 px-2">Savings Rate</th>
                        <th className="text-right py-3 px-2">Savings</th>
                        <th className="text-right py-3 px-2">
                          Total Allocated
                        </th>
                        <th className="text-right py-3 px-2">Status</th>
                        <th className="text-right py-3 px-2">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMonths.map((m) => {
                        const isCurrent =
                          m.year === current.year && m.month === current.month;
                        const isBelow = m.savingsRate < MIN_SAVINGS_RATE;
                        const href = isCurrent
                          ? "/dashboard"
                          : `/budget/${m.year}/${m.month}`;
                        return (
                          <tr
                            key={`desktop-${m.year}-${m.month}`}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {formatMonth(m.year, m.month)}
                                </span>
                                {isCurrent && (
                                  <Badge variant="secondary">Current</Badge>
                                )}
                              </div>
                              {m.adjustmentReason && (
                                <p className="text-xs text-muted-foreground mt-1 max-w-[240px] truncate">
                                  Note: {m.adjustmentReason}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {formatCurrency(m.income, currency)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {formatPercentage(m.savingsRate * 100, 0)}
                            </td>
                            <td className="py-3 px-2 text-right text-savings">
                              {formatCurrency(m.savingsAmount, currency)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {formatCurrency(m.totalAllocated, currency)}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex justify-end gap-2">
                                <Badge
                                  variant={
                                    isBelow ? "destructive" : "secondary"
                                  }
                                >
                                  {isBelow
                                    ? `Below ${MIN_SAVINGS_RATE_PERCENT}%`
                                    : "On track"}
                                </Badge>
                                {m.adjustmentReason && (
                                  <Badge variant="outline">Note</Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={href}>View</Link>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
