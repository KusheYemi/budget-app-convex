"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OnboardingModal } from "@/components/auth/onboarding-modal";
import { Dashboard } from "@/components/budget/dashboard";
import { DashboardLoading } from "@/components/loading/dashboard-loading";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const onboardingStatus = useQuery(api.users.checkOnboardingStatus);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

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
