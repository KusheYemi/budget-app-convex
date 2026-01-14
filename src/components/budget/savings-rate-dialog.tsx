"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatPercentage, MIN_SAVINGS_RATE_PERCENT } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";
import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

interface SavingsRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetMonthId: string;
  currentRate: number; // 0-1
  currentReason: string | null | undefined;
  income: number;
  currency: CurrencyCode;
  onSuccess?: () => void;
}

export function SavingsRateDialog({
  open,
  onOpenChange,
  budgetMonthId,
  currentRate,
  currentReason,
  income,
  currency,
  onSuccess,
}: SavingsRateDialogProps) {
  const updateSavingsRate = useMutation(api.budgets.updateSavingsRate);
  const [rate, setRate] = useState(currentRate * 100);
  const [reason, setReason] = useState(currentReason || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync rate and reason state when dialog opens or props change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRate(currentRate * 100);
    setReason(currentReason || "");
  }, [currentRate, currentReason, open]);

  const needsReason = rate < MIN_SAVINGS_RATE_PERCENT;
  const savingsAmount = income * (rate / 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (needsReason && reason.trim().length < 10) {
      setError("Please provide a reason (at least 10 characters) for saving less than 20%");
      return;
    }

    setLoading(true);
    try {
      await updateSavingsRate({
        budgetMonthId: budgetMonthId as Id<"budgetMonths">,
        savingsRate: rate / 100,
        reason: needsReason ? reason.trim() : undefined,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update savings rate");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Savings Rate</DialogTitle>
          <DialogDescription>
            Set your savings rate for this month. We recommend saving at least 20% of your income.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {/* Rate Display */}
          <div className="text-center py-4">
            <div
              className={cn(
                "text-5xl font-bold",
                rate >= MIN_SAVINGS_RATE_PERCENT ? "text-savings" : "text-warning"
              )}
            >
              {formatPercentage(rate, 0)}
            </div>
            <p className="text-muted-foreground mt-2">
              {formatCurrency(savingsAmount, currency)} per month
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <Label>Savings Rate</Label>
            <Slider
              value={[rate]}
              onValueChange={([value]) => setRate(value)}
              max={50}
              min={0}
              step={1}
              className={cn(
                rate >= MIN_SAVINGS_RATE_PERCENT
                  ? "[&>span:first-child]:bg-savings"
                  : "[&>span:first-child]:bg-warning"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-savings">20% (Recommended)</span>
              <span>50%</span>
            </div>
          </div>

          {/* Warning when below 20% */}
          {needsReason && (
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning font-medium">
                  Lowering your savings rate below 20%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You are decreasing your savings rate below the recommended 20%.
                  Please provide a reason for this month.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for lower savings <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Emergency car repair, Medical expenses, One-time large purchase..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {reason.length}/10 characters minimum
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
