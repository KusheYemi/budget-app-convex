import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Category {
  id: string;
  name: string;
  color: string;
  isSavings: boolean;
  sortOrder: number;
}

interface Allocation {
  id: string;
  budgetMonthId: string;
  categoryId: string;
  amount: number;
  category: Category;
}

interface BudgetMonth {
  id: string;
  income: number;
  savingsRate: number;
  adjustmentReason?: string | null;
  allocations: Allocation[];
}

interface BudgetState {
  // Data
  budgetMonth: BudgetMonth | null;
  categories: Category[];
  currency: string;

  // Actions
  setBudgetMonth: (budgetMonth: BudgetMonth | null) => void;
  setCategories: (categories: Category[]) => void;
  setCurrency: (currency: string) => void;
  setIncome: (income: number) => void;
  setSavingsRate: (rate: number, reason?: string | null) => void;
  setAllocation: (categoryId: string, amount: number) => void;

  // Computed values (as functions for real-time calculation)
  getIncome: () => number;
  getSavingsRate: () => number;
  getSavingsAmount: () => number;
  getTotalAllocated: () => number;
  getRemaining: () => number;
  isOverBudget: () => boolean;
  getAllocationForCategory: (categoryId: string) => number;
}

export const useBudgetStore = create<BudgetState>()(
  immer((set, get) => ({
    budgetMonth: null,
    categories: [],
    currency: "SLE",

    setBudgetMonth: (budgetMonth) =>
      set((state) => {
        state.budgetMonth = budgetMonth;
      }),

    setCategories: (categories) =>
      set((state) => {
        state.categories = categories;
      }),

    setCurrency: (currency) =>
      set((state) => {
        state.currency = currency;
      }),

    setIncome: (income) =>
      set((state) => {
        if (state.budgetMonth) {
          state.budgetMonth.income = income;
        }
      }),

    setSavingsRate: (rate, reason) =>
      set((state) => {
        if (state.budgetMonth) {
          state.budgetMonth.savingsRate = rate;
          state.budgetMonth.adjustmentReason = reason ?? null;
        }
      }),

    setAllocation: (categoryId, amount) =>
      set((state) => {
        if (!state.budgetMonth) return;

        const existingIndex = state.budgetMonth.allocations.findIndex(
          (a) => a.categoryId === categoryId
        );

        if (existingIndex >= 0) {
          if (amount === 0) {
            // Remove allocation
            state.budgetMonth.allocations.splice(existingIndex, 1);
          } else {
            // Update allocation
            state.budgetMonth.allocations[existingIndex].amount = amount;
          }
        } else if (amount > 0) {
          // Find the category
          const category = state.categories.find((c) => c.id === categoryId);
          if (category) {
            // Add new allocation (with placeholder values for required fields)
            state.budgetMonth.allocations.push({
              id: `temp-${categoryId}`,
              budgetMonthId: state.budgetMonth.id,
              categoryId,
              amount,
              category,
            });
          }
        }
      }),

    getIncome: () => {
      const { budgetMonth } = get();
      return budgetMonth ? Number(budgetMonth.income) : 0;
    },

    getSavingsRate: () => {
      const { budgetMonth } = get();
      return budgetMonth ? budgetMonth.savingsRate : 0.2;
    },

    getSavingsAmount: () => {
      const { budgetMonth } = get();
      if (!budgetMonth) return 0;
      return Number(budgetMonth.income) * budgetMonth.savingsRate;
    },

    getTotalAllocated: () => {
      const { budgetMonth } = get();
      if (!budgetMonth) return 0;

      const savingsAmount = Number(budgetMonth.income) * budgetMonth.savingsRate;
      const otherAllocations = budgetMonth.allocations
        .filter((a) => !a.category.isSavings)
        .reduce((sum, a) => sum + Number(a.amount), 0);

      return savingsAmount + otherAllocations;
    },

    getRemaining: () => {
      const income = get().getIncome();
      const totalAllocated = get().getTotalAllocated();
      return income - totalAllocated;
    },

    isOverBudget: () => {
      return get().getRemaining() < 0;
    },

    getAllocationForCategory: (categoryId) => {
      const { budgetMonth } = get();
      if (!budgetMonth) return 0;
      const allocation = budgetMonth.allocations.find(
        (a) => a.categoryId === categoryId
      );
      return allocation ? Number(allocation.amount) : 0;
    },
  }))
);
