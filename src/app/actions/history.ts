"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface HistoryMonth {
  year: number;
  month: number;
  income: number;
  savingsRate: number;
  savingsAmount: number;
  totalAllocated: number;
  adjustmentReason: string | null;
}

export async function getBudgetHistory(): Promise<HistoryMonth[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const budgetMonths = await prisma.budgetMonth.findMany({
    where: { userId: user.id },
    include: {
      allocations: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return budgetMonths.map((bm) => {
    const income = Number(bm.income);
    const savingsAmount = income * bm.savingsRate;
    const totalAllocated =
      savingsAmount +
      bm.allocations
        .filter((a) => !a.category.isSavings)
        .reduce((sum, a) => sum + Number(a.amount), 0);

    return {
      year: bm.year,
      month: bm.month,
      income,
      savingsRate: bm.savingsRate,
      savingsAmount,
      totalAllocated,
      adjustmentReason: bm.adjustmentReason,
    };
  });
}
