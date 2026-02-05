"use client";

import { useState, useEffect, memo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  formatCurrency,
  formatPercentage,
  calculatePercentage,
} from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { MoreVertical, Pencil, Trash2, Sparkles } from "lucide-react";

interface CategoryRowProps {
  id: string;
  budgetMonthId: string;
  name: string;
  color: string;
  amount: number;
  totalIncome: number;
  currency: CurrencyCode;
  isSavings: boolean;
  isReadOnly: boolean;
  onUpdate?: (categoryId: string, amount: number) => void;
  onRefresh?: () => void;
  onDelete?: (categoryId: string) => void;
}

export const CategoryRow = memo(function CategoryRow({
  id,
  budgetMonthId,
  name,
  color,
  amount,
  totalIncome,
  currency,
  isSavings,
  isReadOnly,
  onUpdate,
  onRefresh,
  onDelete,
}: CategoryRowProps) {
  const updateAllocation = useMutation(api.allocations.updateAllocation);
  const removeFromMonth = useMutation(api.allocations.removeFromMonth);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(amount.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setEditValue(amount.toString());
  }, [amount]);

  const percentage = calculatePercentage(amount, totalIncome);

  async function handleSave() {
    const newAmount = parseFloat(editValue) || 0;
    if (newAmount === amount) {
      setIsEditing(false);
      return;
    }

    onUpdate?.(id, newAmount);
    setIsEditing(false);

    setIsLoading(true);
    try {
      await updateAllocation({
        budgetMonthId: budgetMonthId as Id<"budgetMonths">,
        categoryId: id as Id<"categories">,
        amount: newAmount,
      });
      onRefresh?.();
    } catch (err) {
      onUpdate?.(id, amount);
      toast.error("Failed to update allocation", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
    setIsLoading(false);
  }

  async function handleDelete() {
    if (isSavings) return;

    setShowDeleteDialog(false);
    setIsLoading(true);
    try {
      await removeFromMonth({
        budgetMonthId: budgetMonthId as Id<"budgetMonths">,
        categoryId: id as Id<"categories">,
      });
      onDelete?.(id);
      onRefresh?.();
      toast.success("Category removed from this month");
    } catch (err) {
      toast.error("Failed to remove category", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
    setIsLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(amount.toString());
      setIsEditing(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 transition-all duration-200",
          isSavings && "bg-savings/5",
          !isReadOnly && !isSavings && "hover:bg-muted/30"
        )}
      >
        {/* Category color indicator with glow */}
        <div className="relative flex-shrink-0">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: color }}
          />
          <div
            className="absolute inset-0 rounded-full blur-md opacity-50"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Category info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-medium truncate",
                isSavings && "text-savings"
              )}
            >
              {name}
            </p>
            {isSavings && (
              <span className="flex items-center gap-1 text-xs bg-savings/10 text-savings px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Auto
              </span>
            )}
          </div>

          {/* Progress bar for this category */}
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-32">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatPercentage(percentage, 0)}
            </span>
          </div>
        </div>

        {/* Amount display/edit */}
        <div className="flex items-center gap-2">
          {isEditing && !isReadOnly && !isSavings ? (
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-28 h-10 text-right text-base font-mono rounded-xl"
              min="0"
              step="0.01"
              autoFocus
              disabled={isLoading}
            />
          ) : (
            <button
              onClick={() => !isReadOnly && !isSavings && setIsEditing(true)}
              className={cn(
                "text-right font-mono tabular-nums text-base sm:text-lg font-semibold px-3 py-2 rounded-xl transition-all",
                !isReadOnly &&
                  !isSavings &&
                  "hover:bg-primary/10 hover:text-primary cursor-pointer",
                (isReadOnly || isSavings) && "cursor-default",
                isSavings && "text-savings"
              )}
              disabled={isReadOnly || isSavings}
            >
              {formatCurrency(amount, currency)}
            </button>
          )}

          {/* Actions menu */}
          {!isReadOnly && !isSavings && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem
                  onClick={() => setIsEditing(true)}
                  className="gap-2 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                  Edit amount
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="gap-2 rounded-lg text-destructive focus:text-destructive"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove from month
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Remove category from this month?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{name}&quot; from this month&apos;s budget.
              The category will still be available for other months.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
