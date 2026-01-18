"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatMonth,
  getCurrentMonth,
  isCurrentMonth,
  isEditableMonth,
  isPastMonth,
  MAX_FUTURE_MONTHS,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MonthPickerProps {
  year: number;
  month: number;
  availableMonths?: { year: number; month: number }[];
}

export function MonthPicker({ year, month }: MonthPickerProps) {
  const router = useRouter();
  const current = getCurrentMonth();
  const isCurrent = isCurrentMonth(year, month);

  function goToPreviousMonth() {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    if (isCurrentMonth(newYear, newMonth)) {
      router.push("/dashboard");
    } else {
      router.push(`/budget/${newYear}/${newMonth}`);
    }
  }

  function goToNextMonth() {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    // Don't go beyond MAX_FUTURE_MONTHS
    if (!isEditableMonth(newYear, newMonth)) {
      return;
    }
    if (isCurrentMonth(newYear, newMonth)) {
      router.push("/dashboard");
    } else {
      router.push(`/budget/${newYear}/${newMonth}`);
    }
  }

  function goToMonth(value: string) {
    const [y, m] = value.split("-").map(Number);
    if (y === current.year && m === current.month) {
      router.push("/dashboard");
    } else {
      router.push(`/budget/${y}/${m}`);
    }
  }

  // Check if next month is within editable range
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const canGoNext = isEditableMonth(nextYear, nextMonth);

  // Generate months: future (up to MAX_FUTURE_MONTHS) + current + past 12
  const monthOptions: { year: number; month: number }[] = [];
  let tempYear = current.year;
  let tempMonth = current.month;

  // Add future months
  for (let i = 0; i < MAX_FUTURE_MONTHS; i++) {
    tempMonth += 1;
    if (tempMonth > 12) {
      tempMonth = 1;
      tempYear += 1;
    }
    monthOptions.push({ year: tempYear, month: tempMonth });
  }

  // Add current month
  monthOptions.push({ year: current.year, month: current.month });

  // Add past 12 months
  tempYear = current.year;
  tempMonth = current.month;
  for (let i = 0; i < 12; i++) {
    tempMonth -= 1;
    if (tempMonth < 1) {
      tempMonth = 12;
      tempYear -= 1;
    }
    monthOptions.push({ year: tempYear, month: tempMonth });
  }

  // Sort: future first (descending by date), then current, then past
  monthOptions.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        onClick={goToPreviousMonth}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span className="sr-only">Previous month</span>
      </Button>

      <Select value={`${year}-${month}`} onValueChange={goToMonth}>
        <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-sm">
          <SelectValue>{formatMonth(year, month)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((opt) => (
            <SelectItem
              key={`${opt.year}-${opt.month}`}
              value={`${opt.year}-${opt.month}`}
            >
              {formatMonth(opt.year, opt.month)}
              {isCurrentMonth(opt.year, opt.month) && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Current)
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        onClick={goToNextMonth}
        disabled={!canGoNext}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="sr-only">Next month</span>
      </Button>

      {isPastMonth(year, month) && (
        <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
          Read-only
        </Badge>
      )}
      {isEditableMonth(year, month) && !isCurrent && (
        <Badge variant="outline" className="ml-1 sm:ml-2 text-xs border-blue-400 text-blue-600">
          Planning
        </Badge>
      )}
    </div>
  );
}
