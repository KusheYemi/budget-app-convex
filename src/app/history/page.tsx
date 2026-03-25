"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { HistoryContent } from "@/components/history/history-content";
import { HistoryLoading } from "@/components/loading/history-loading";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getUserCurrency } from "@/lib/utils";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const user = useQuery(api.users.getCurrentUser);
  const history = useQuery(api.insights.getBudgetHistory);

  const shouldRedirect =
    !authLoading &&
    isAuthenticated &&
    user !== undefined &&
    history !== undefined &&
    (!history || history.length === 0);

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/dashboard");
    }
  }, [shouldRedirect, router]);

  if (authLoading || user === undefined || history === undefined) {
    return <HistoryLoading />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <HistoryContent
      months={history}
      currency={getUserCurrency(user)}
      email={user.email ?? ""}
    />
  );
}
