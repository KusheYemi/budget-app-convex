"use client";

import { useSearchParams } from "next/navigation";
import { ResetRequestForm } from "@/components/auth/reset-request-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const resetCode = searchParams.get("resetCode");
  const email = searchParams.get("email") ?? "";

  if (resetCode) {
    return <ResetPasswordForm code={resetCode} email={email} />;
  }

  return <ResetRequestForm />;
}
