"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { getCurrentMonth } from "@/lib/utils";

function isAuthError(error: Error): boolean {
  return (
    error.message.includes("Not authenticated") ||
    error.message.includes("Unauthenticated")
  );
}

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter();
  const { year, month } = getCurrentMonth();

  useEffect(() => {
    if (isAuthError(error)) router.replace("/login");
  }, [error, router]);

  if (isAuthError(error)) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header email="" year={year} month={month} />
      <div className="flex items-center justify-center py-24 px-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="p-4 rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              {error.message || "An unexpected error occurred."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
