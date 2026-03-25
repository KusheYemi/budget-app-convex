import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { CURRENCIES, type CurrencyCode } from "./validators";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode = "SLE"): string {
  const currency = CURRENCIES[currencyCode];
  return `${currency.symbol}${currencyFormatter.format(amount)}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculatePercentage(amount: number, total: number): number {
  if (total === 0) return 0;
  return (amount / total) * 100;
}

export function formatMonth(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return format(date, "MMMM yyyy");
}

export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function isCurrentMonth(year: number, month: number): boolean {
  const current = getCurrentMonth();
  return year === current.year && month === current.month;
}

export function isPastMonth(year: number, month: number): boolean {
  const current = getCurrentMonth();
  if (year < current.year) return true;
  if (year === current.year && month < current.month) return true;
  return false;
}

export const MIN_SAVINGS_RATE = 0.20;
export const MIN_SAVINGS_RATE_PERCENT = 20;

export const MAX_FUTURE_MONTHS = 12;

export function getUserCurrency(user: { currency?: string | null }): CurrencyCode {
  return (user.currency as CurrencyCode) ?? "SLE";
}

/** Must stay in sync with DEFAULT_CATEGORIES in convex/constants.ts. */
export const DEFAULT_CATEGORY_NAMES = [
  "Savings",
  "Transport & Food",
  "Utilities",
  "Partner & Child Support",
  "Subscriptions",
  "Fun",
  "Remittance",
] as const;

export function isEditableMonth(year: number, month: number): boolean {
  const current = getCurrentMonth();

  if (year < current.year) return false;
  if (year === current.year && month < current.month) return false;

  const monthsAhead = (year - current.year) * 12 + (month - current.month);
  return monthsAhead <= MAX_FUTURE_MONTHS;
}
