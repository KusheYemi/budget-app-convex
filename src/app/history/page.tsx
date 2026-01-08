import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";
import { getBudgetHistory } from "@/app/actions/history";
import { HistoryContent } from "@/components/history/history-content";
import type { CurrencyCode } from "@/lib/validators";

export default async function HistoryPage() {
  const [profile, history] = await Promise.all([
    getUserProfile(),
    getBudgetHistory(),
  ]);

  if (!profile) {
    redirect("/login");
  }

  if (!history) {
    redirect("/");
  }

  return (
    <HistoryContent
      months={history}
      currency={profile.currency as CurrencyCode}
      email={profile.email}
    />
  );
}
