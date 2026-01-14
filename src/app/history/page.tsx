"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { HistoryContent } from "@/components/history/history-content";
import type { CurrencyCode } from "@/lib/validators";
import { HistoryLoading } from "@/components/loading/history-loading";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const history = useQuery(api.insights.getBudgetHistory);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || user === undefined || history === undefined) {
    return <HistoryLoading />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!history || history.length === 0) {
    router.push("/dashboard");
    return null;
  }

  return (
    <HistoryContent
      months={history}
      currency={(user.currency as CurrencyCode) ?? "SLE"}
      email={user.email ?? ""}
    />
  );
}
