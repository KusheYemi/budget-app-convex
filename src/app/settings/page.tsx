"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SettingsContent } from "@/components/settings/settings-content";
import { getCurrentMonth, getUserCurrency } from "@/lib/utils";
import { SettingsLoading } from "@/components/loading/settings-loading";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const user = useQuery(api.users.getCurrentUser);

  const { year, month } = getCurrentMonth();

  if (authLoading || user === undefined) {
    return <SettingsLoading />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SettingsContent
      email={user.email ?? ""}
      currency={getUserCurrency(user)}
      year={year}
      month={month}
    />
  );
}
