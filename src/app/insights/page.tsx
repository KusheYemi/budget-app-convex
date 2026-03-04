"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { InsightsContent } from "@/components/insights/insights-content";
import { InsightsLoading } from "@/components/loading/insights-loading";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getUserCurrency } from "@/lib/utils";

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const user = useQuery(api.users.getCurrentUser);
  const insightsData = useQuery(api.insights.getInsightsData);

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
      currency={getUserCurrency(user)}
      email={user.email ?? ""}
    />
  );
}
