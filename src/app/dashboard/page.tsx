"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OnboardingModal } from "@/components/auth/onboarding-modal";
import { Dashboard } from "@/components/budget/dashboard";
import { DashboardLoading } from "@/components/loading/dashboard-loading";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  const onboardingStatus = useQuery(api.users.checkOnboardingStatus);

  // Loading state
  if (authLoading || onboardingStatus === undefined) {
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
  return <Dashboard ensureCurrentMonth />;
}
