"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SettingsContent } from "@/components/settings/settings-content";
import { getCurrentMonth } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";
import { SettingsLoading } from "@/components/loading/settings-loading";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);

  const { year, month } = getCurrentMonth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || user === undefined) {
    return <SettingsLoading />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SettingsContent
      email={user.email ?? ""}
      currency={(user.currency as CurrencyCode) ?? "SLE"}
      year={year}
      month={month}
    />
  );
}
