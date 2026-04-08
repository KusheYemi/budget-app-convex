export interface InsightsData {
  totalMonths: number;
  averageIncome: number;
  averageSavingsRate: number;
  averageSavingsAmount: number;
  totalSaved: number;
  monthlyTrends: Array<{
    year: number;
    month: number;
    income: number;
    savingsRate: number;
    savingsAmount: number;
    totalAllocated: number;
  }>;
  topCategories: Array<{
    name: string;
    total: number;
    color: string;
  }>;
  monthsWithLowSavings: Array<{
    year: number;
    month: number;
    savingsRate: number;
    adjustmentReason?: string | null;
  }>;
}
