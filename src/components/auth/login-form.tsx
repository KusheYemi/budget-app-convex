"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { AuthCard } from "@/components/auth/auth-card";
import { AnimatedFormError } from "@/components/auth/animated-form-error";
import { PasswordToggleButton } from "@/components/ui/password-toggle-button";

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn("password", { email, password, flow: "signIn" });
      toast.success("Welcome back!", {
        description: "You have been signed in successfully.",
      });
      router.push("/");
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err, "signIn");
      setError(errorMessage);
      toast.error("Sign in failed", {
        description: errorMessage,
      });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center lg:text-left"
      >
        <h2 className="text-3xl sm:text-4xl font-serif tracking-tight mb-2">
          Welcome <span className="text-primary italic">back</span>
        </h2>
        <p className="text-muted-foreground">
          Sign in to continue managing your finances
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
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className={`text-sm font-medium transition-colors ${
                  focusedField === "password" ? "text-primary" : ""
                }`}
              >
                Password
              </Label>
              <Link
                href="/reset-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
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
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
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
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            disabled={loading}
          >
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </motion.div>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
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
              New to Ledgerise?
            </span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link href="/signup" className="block">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-medium hover:bg-primary/5 hover:border-primary/50 transition-all"
          >
            Create an account
          </Button>
        </Link>
      </AuthCard>

    </div>
  );
}
