"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, type CurrencyCode } from "@/lib/validators";

export function OnboardingModal() {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("SLE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    if (!income || parseFloat(income) <= 0) {
      setError("Please enter a valid income amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await completeOnboarding({
        income: parseFloat(income),
        currency,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete setup");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Ledgerise!</CardTitle>
          <CardDescription>
            Let&apos;s set up your first monthly budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-lg font-medium">Track Your Finances</h3>
                <p className="text-muted-foreground mt-2">
                  We&apos;ll help you manage your monthly income, set savings goals,
                  and allocate your budget across different categories.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Default categories:</p>
                <div className="flex flex-wrap gap-2">
                  {["Savings", "Transport & Food", "Utilities", "Partner & Child Support", "Subscriptions", "Fun", "Remittance"].map(
                    (cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                      >
                        {cat}
                      </span>
                    )
                  )}
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>
                Get Started
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as CurrencyCode)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CURRENCIES).map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} - {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Monthly Income</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {CURRENCIES[currency].symbol}
                    </span>
                    <Input
                      id="income"
                      type="number"
                      placeholder="0.00"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is your total monthly income before any deductions
                  </p>
                </div>
              </div>
              <div className="p-4 bg-savings/10 rounded-lg">
                <p className="text-sm">
                  <strong>Savings Goal:</strong> We recommend saving at least{" "}
                  <span className="text-savings font-medium">20%</span> of your
                  income each month. You can adjust this later.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
