"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateIncome } from "@/app/actions/budget";
import { CURRENCIES, type CurrencyCode } from "@/lib/validators";

interface EditIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetMonthId: string;
  currentIncome: number;
  currency: CurrencyCode;
  onSuccess?: () => void;
}

export function EditIncomeDialog({
  open,
  onOpenChange,
  budgetMonthId,
  currentIncome,
  currency,
  onSuccess,
}: EditIncomeDialogProps) {
  const [income, setIncome] = useState(currentIncome.toString());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync income state when dialog opens or currentIncome changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIncome(currentIncome.toString());
  }, [currentIncome, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const newIncome = parseFloat(income);
    if (isNaN(newIncome) || newIncome < 0) {
      setError("Please enter a valid income amount");
      return;
    }

    setLoading(true);
    const result = await updateIncome(budgetMonthId, newIncome);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess?.();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Monthly Income</DialogTitle>
          <DialogDescription>
            Update your total monthly income for this budget period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="income">Monthly Income</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {CURRENCIES[currency].symbol}
              </span>
              <Input
                id="income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="pl-10"
                min="0"
                step="0.01"
              />
            </div>
          </div>

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
