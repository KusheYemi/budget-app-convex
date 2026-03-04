"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Dashboard } from "@/components/budget/dashboard";
import { BudgetLoading } from "@/components/loading/budget-loading";
import { isEditableMonth } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";

function parseParam(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return NaN;
  }
  return Number.parseInt(value, 10);
}

export default function BudgetMonthPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth({ method: "replace" });

  const year = parseParam(params.year);
  const month = parseParam(params.month);
  const isValid =
    Number.isFinite(year) &&
    Number.isFinite(month) &&
    month >= 1 &&
    month <= 12 &&
    year >= 2020 &&
    year <= 2100;

  useEffect(() => {
    if (!authLoading && isAuthenticated && !isValid) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, isValid, router]);

  if (authLoading || !isValid) {
    return <BudgetLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Auto-create budget month for editable months (current and future)
  const shouldEnsure = isEditableMonth(year, month);
  return <Dashboard initialYear={year} initialMonth={month} ensureCurrentMonth={shouldEnsure} />;
}
