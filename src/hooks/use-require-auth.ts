"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";

/**
 * Redirects unauthenticated users to /login.
 * Returns `isAuthenticated` and `isLoading` so pages can render guards.
 */
export function useRequireAuth(options?: { method?: "push" | "replace" }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (options?.method === "replace") {
        router.replace("/login");
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, router, options?.method]);

  return { isAuthenticated, isLoading };
}
