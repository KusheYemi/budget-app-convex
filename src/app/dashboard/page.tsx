import { redirect } from "next/navigation";
import { checkOnboardingStatus, getUserProfile } from "@/app/actions/auth";
import { OnboardingModal } from "@/components/auth/onboarding-modal";
import { Dashboard } from "@/components/budget/dashboard";
import { getOrCreateBudgetMonth } from "@/app/actions/budget";
import { getCategories } from "@/app/actions/categories";
import { getCurrentMonth } from "@/lib/utils";

export default async function DashboardPage() {
  const { needsOnboarding, user } = await checkOnboardingStatus();

  if (!user) {
    redirect("/login");
  }

  if (needsOnboarding) {
    return <OnboardingModal />;
  }

  const { year, month } = getCurrentMonth();

  const [profile, budgetMonth, categories] = await Promise.all([
    getUserProfile(),
    getOrCreateBudgetMonth(year, month),
    getCategories(),
  ]);

  return (
    <Dashboard
      initialData={{ profile, budgetMonth: budgetMonth as never, categories }}
    />
  );
}
