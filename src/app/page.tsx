import { checkOnboardingStatus } from "@/app/actions/auth";
import { LandingPage } from "@/components/landing-page";

export default async function HomePage() {
  const { user } = await checkOnboardingStatus();
  return <LandingPage isLoggedIn={!!user} />;
}
