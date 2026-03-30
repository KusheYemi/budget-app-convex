"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

function isAuthError(error: Error): boolean {
  return (
    error.message.includes("Not authenticated") ||
    error.message.includes("Unauthenticated")
  );
}

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthError(error)) {
      router.replace("/login");
    } else {
      console.error(error);
    }
  }, [error, router]);

  if (isAuthError(error)) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
        <div className="p-4 rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-serif">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <Button onClick={reset} className="rounded-xl">
          Try again
        </Button>
      </div>
    </div>
  );
}
