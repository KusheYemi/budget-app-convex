"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { AuthCard } from "@/components/auth/auth-card";
import { AnimatedFormError } from "@/components/auth/animated-form-error";
import { PasswordToggleButton } from "@/components/ui/password-toggle-button";

export function ResetPasswordForm({
  email: initialEmail,
  code,
}: {
  email?: string;
  code: string;
}) {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError("This reset link is missing or invalid. Request a new one.");
      return;
    }

    if (!email) {
      setError("Please enter the email you used to create your account.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signIn("password", {
        flow: "reset-verification",
        email,
        code,
        newPassword: password,
      });
      toast.success("Password updated", {
        description: "You can now continue to your dashboard.",
      });
      router.push("/dashboard");
    } catch (err) {
      const message = getAuthErrorMessage(err, "reset");
      setError(message);
      toast.error("Reset failed", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center lg:text-left"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Set a new password
        </h2>
        <p className="text-muted-foreground">
          {email ? `Resetting password for ${email}` : "Choose a strong new password."}
        </p>
      </motion.div>

      <AuthCard delay={0.1}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatedFormError error={error} />

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-12 bg-background/50 border-border/50 rounded-xl transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a new password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pl-11 pr-12 h-12 bg-background/50 border-border/50 rounded-xl transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <PasswordToggleButton
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm new password
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="pl-11 pr-12 h-12 bg-background/50 border-border/50 rounded-xl transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <PasswordToggleButton
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Update password
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}
