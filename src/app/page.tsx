"use client";

import { useConvexAuth } from "convex/react";
import dynamic from "next/dynamic";
import { HomeLoading } from "@/components/loading/home-loading";

const LandingPage = dynamic(
  () => import("@/components/landing-page").then((m) => ({ default: m.LandingPage })),
  { loading: () => <HomeLoading /> }
);

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <HomeLoading />;
  }

  return <LandingPage isLoggedIn={isAuthenticated} />;
}
