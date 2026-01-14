"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OnboardingModal } from "@/components/auth/onboarding-modal";
import { Dashboard } from "@/components/budget/dashboard";
import { DashboardLoading } from "@/components/loading/dashboard-loading";
import { getCurrentMonth } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  // Queries
  const onboardingStatus = useQuery(api.users.checkOnboardingStatus);
  const user = useQuery(api.users.getCurrentUser);
  const categories = useQuery(api.categories.getCategories);

  const { year, month } = getCurrentMonth();
  const budgetMonth = useQuery(api.budgets.getBudgetMonth, { year, month });

  // Create budget month if needed
  const getOrCreateBudget = useMutation(api.budgets.getOrCreateBudgetMonth);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Create budget month if it doesn't exist
    if (
      isAuthenticated &&
      onboardingStatus &&
      !onboardingStatus.needsOnboarding &&
      budgetMonth === null
    ) {
      getOrCreateBudget({ year, month });
    }
  }, [isAuthenticated, onboardingStatus, budgetMonth, year, month, getOrCreateBudget]);

  // Loading state
  if (
    authLoading ||
    onboardingStatus === undefined ||
    user === undefined ||
    categories === undefined ||
    budgetMonth === undefined
  ) {
    return <DashboardLoading />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Needs onboarding
  if (onboardingStatus.needsOnboarding) {
    return <OnboardingModal />;
  }

  // Dashboard
  return (
    <Dashboard
      initialData={{
        profile: user,
        budgetMonth: budgetMonth as never,
        categories,
      }}
    />
  );
}
