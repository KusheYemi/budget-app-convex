"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderIcon,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Coins, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { CURRENCIES, type CurrencyCode } from "@/lib/validators";

interface SettingsContentProps {
  email: string;
  currency: CurrencyCode;
  year: number;
  month: number;
}

export function SettingsContent({
  email,
  currency,
  year,
  month,
}: SettingsContentProps) {
  const updateCurrency = useMutation(api.users.updateCurrency);
  const { signIn } = useAuthActions();
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyCode>(currency);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCurrency({ currency: selectedCurrency });
      toast.success("Settings updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again.";
      toast.error("Failed to update settings", {
        description: message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendResetLink() {
    setPasswordError(null);

    if (!email) {
      setPasswordError("We couldn't find an email for this account.");
      return;
    }

    setSendingReset(true);
    try {
      await signIn("password", {
        flow: "reset",
        email,
        redirectTo: `/reset-password?email=${encodeURIComponent(email)}`,
      });
      toast.success("Check your email", {
        description: "We sent you a password reset link.",
      });
    } catch (err) {
      const message = getAuthErrorMessage(err, "reset");
      setPasswordError(message);
      toast.error("Reset failed", {
        description: message,
      });
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="min-h-screen bg-background grain">
      <Header email={email} year={year} month={month} />

      <main className="container py-6 sm:py-8 space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="page-title text-3xl sm:text-4xl text-foreground">
            <span className="text-primary italic">Settings</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="max-w-xl border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardHeaderIcon tone="primary">
                  <Coins className="w-5 h-5" />
                </CardHeaderIcon>
                <div className="flex-1">
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription className="mt-1">
                    Your currency affects how amounts are displayed.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Preferred currency</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(value) =>
                    setSelectedCurrency(value as CurrencyCode)
                  }
                >
                  <SelectTrigger id="currency">
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

              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save settings"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="max-w-xl border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardHeaderIcon tone="savings">
                  <ShieldCheck className="w-5 h-5" />
                </CardHeaderIcon>
                <div className="flex-1">
                  <CardTitle>Security</CardTitle>
                  <CardDescription className="mt-1">
                    We&apos;ll email you a secure link to reset your password.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl"
                >
                  {passwordError}
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                We&apos;ll send the reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>

              <Button onClick={handleSendResetLink} disabled={sendingReset}>
                {sendingReset && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {sendingReset ? "Sending..." : "Email reset link"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
