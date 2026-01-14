"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { InsightsContent } from "@/components/insights/insights-content";
import type { CurrencyCode } from "@/lib/validators";
import { InsightsLoading } from "@/components/loading/insights-loading";

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const insightsData = useQuery(api.insights.getInsightsData);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || user === undefined || insightsData === undefined) {
    return <InsightsLoading />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!insightsData) {
    router.push("/dashboard");
    return null;
  }

  return (
    <InsightsContent
      data={insightsData}
      currency={(user.currency as CurrencyCode) ?? "SLE"}
      email={user.email ?? ""}
    />
  );
}
