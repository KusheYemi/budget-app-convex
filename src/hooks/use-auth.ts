"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export function useAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return {
    isLoading,
    isAuthenticated,
    signOut: async () => {
      await signOut();
    },
  };
}
