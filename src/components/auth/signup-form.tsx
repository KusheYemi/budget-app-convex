"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Check,
  X,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { AuthCard } from "@/components/auth/auth-card";
import { AnimatedFormError } from "@/components/auth/animated-form-error";
import { PasswordToggleButton } from "@/components/ui/password-toggle-button";

// Password strength calculation
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Weak", color: "bg-error" };
  if (score <= 2) return { score, label: "Fair", color: "bg-warning" };
  if (score <= 3) return { score, label: "Good", color: "bg-warning" };
  if (score <= 4) return { score, label: "Strong", color: "bg-success" };
  return { score, label: "Very Strong", color: "bg-savings" };
}

// Password requirements
const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
];

export function SignUpForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const pwd = formData.get("password") as string;
    const confirmPwd = formData.get("confirmPassword") as string;

    // Client-side validation
    if (pwd !== confirmPwd) {
      setError("Passwords do not match");
      toast.error("Validation error", {
        description: "Passwords do not match",
      });
      setLoading(false);
      return;
    }

    if (pwd.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Validation error", {
        description: "Password must be at least 8 characters",
      });
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      toast.error("Validation error", {
        description: "Please accept the terms and conditions",
      });
      setLoading(false);
      return;
    }

    try {
      await signIn("password", { email, password: pwd, flow: "signUp" });
      toast.success("Account created!", {
        description: "Welcome to Ledgerise. Let's set up your budget.",
      });
      router.push("/");
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err, "signUp");
      setError(errorMessage);
      toast.error("Sign up failed", {
        description: errorMessage,
      });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center lg:text-left"
      >
        <h2 className="text-3xl sm:text-4xl font-serif tracking-tight mb-2">
          Create your <span className="text-primary italic">account</span>
        </h2>
        <p className="text-muted-foreground">
          Start your journey to financial clarity
        </p>
      </motion.div>

      {/* Form Card */}
      <AuthCard delay={0.1}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          <AnimatedFormError error={error} />

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={`text-sm font-medium transition-colors ${
                focusedField === "email" ? "text-primary" : ""
              }`}
            >
              Email address
            </Label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === "email"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="pl-11 h-12 bg-background/50 border-border/50 rounded-xl"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className={`text-sm font-medium transition-colors ${
                focusedField === "password" ? "text-primary" : ""
              }`}
            >
              Password
            </Label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === "password"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="pl-11 pr-12 h-12 bg-background/50 border-border/50 rounded-xl"
              />
              <PasswordToggleButton
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                disabled={loading}
              />
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-2"
              >
                {/* Strength Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Password strength
                    </span>
                    <span
                      className={`font-medium ${
                        passwordStrength.score <= 1
                          ? "text-error"
                          : passwordStrength.score <= 2
                            ? "text-warning"
                            : passwordStrength.score <= 3
                              ? "text-warning"
                              : "text-success"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${passwordStrength.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 gap-2">
                  {passwordRequirements.map((req, i) => {
                    const passed = req.test(password);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-2 text-xs ${
                          passed ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {passed ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {req.label}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className={`text-sm font-medium transition-colors ${
                focusedField === "confirmPassword" ? "text-primary" : ""
              }`}
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === "confirmPassword"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                className={`pl-11 pr-12 h-12 bg-background/50 border-border/50 rounded-xl ${
                  confirmPassword && !passwordsMatch
                    ? "border-destructive"
                    : confirmPassword && passwordsMatch
                      ? "border-success"
                      : ""
                }`}
              />
              <PasswordToggleButton
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              />
            </div>
            {confirmPassword && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs flex items-center gap-1 ${
                  passwordsMatch ? "text-success" : "text-destructive"
                }`}
              >
                {passwordsMatch ? (
                  <>
                    <Check className="w-3 h-3" /> Passwords match
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" /> Passwords do not match
                  </>
                )}
              </motion.p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={acceptTerms ? "true" : "false"}
              onClick={() => setAcceptTerms(!acceptTerms)}
              className={`mt-0.5 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 ${
                acceptTerms
                  ? "bg-primary border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {acceptTerms && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </button>
            <Label
              className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
              onClick={() => setAcceptTerms(!acceptTerms)}
            >
              I agree to the{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            disabled={loading || !acceptTerms}
          >
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </motion.div>
            ) : (
              <span className="flex items-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link href="/login" className="block">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-medium hover:bg-primary/5 hover:border-primary/50 transition-all"
          >
            Sign in instead
          </Button>
        </Link>
      </AuthCard>

      {/* Trust Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-success" />
          <span>Bank-level encryption</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>Free forever, no credit card</span>
        </div>
      </motion.div>
    </div>
  );
}
