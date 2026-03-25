"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import type { Category } from "./types";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#ef4444", // Red
  "#84cc16", // Lime
  "#14b8a6", // Teal
];

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetMonthId: string;
  categories: Category[];
  allocationAmounts: Map<string, number>;
  onSuccess?: () => void;
}

export function AddCategoryDialog({ open, onOpenChange, budgetMonthId, categories, allocationAmounts, onSuccess }: AddCategoryDialogProps) {
  const createCategory = useMutation(api.categories.createCategory);
  const addToMonth = useMutation(api.allocations.addToMonth);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [readdingId, setReaddingId] = useState<string | null>(null);

  const unallocatedCategories = useMemo(
    () => categories.filter((c) => !c.isSavings && !allocationAmounts.has(c.id)),
    [categories, allocationAmounts]
  );

  async function handleReaddCategory(categoryId: string) {
    setError(null);
    setReaddingId(categoryId);
    try {
      await addToMonth({
        budgetMonthId: budgetMonthId as Id<"budgetMonths">,
        categoryId: categoryId as Id<"categories">,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setReaddingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    try {
      await createCategory({
        name: name.trim(),
        color,
        budgetMonthId: budgetMonthId as Id<"budgetMonths">,
      });
      setName("");
      setColor(PRESET_COLORS[0]);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    }
    setLoading(false);
  }

  function handleClose() {
    setName("");
    setColor(PRESET_COLORS[0]);
    setError(null);
    setReaddingId(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            {unallocatedCategories.length > 0
              ? "Re-add a previous category or create a new one."
              : "Create a new budget category to track your spending."}
          </DialogDescription>
        </DialogHeader>

        <FormError error={error} />

        {unallocatedCategories.length > 0 && (
          <>
            <div className="space-y-2">
              <Label>Previous categories</Label>
              <div className="grid gap-1.5">
                {unallocatedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={readdingId !== null}
                    onClick={() => handleReaddCategory(cat.id)}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium">{cat.name}</span>
                    {readdingId === cat.id && (
                      <span className="ml-auto text-xs text-muted-foreground">Adding...</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-1">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                or create new
              </span>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries, Entertainment"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
