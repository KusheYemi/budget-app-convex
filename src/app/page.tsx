"use client";

import { useConvexAuth } from "convex/react";
import { LandingPage } from "@/components/landing-page";
import { HomeLoading } from "@/components/loading/home-loading";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <HomeLoading />;
  }

  return <LandingPage isLoggedIn={isAuthenticated} />;
}
