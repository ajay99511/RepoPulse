import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { fetchUserProfile, fetchAllRepositories } from "@/lib/github";
import DashboardClient from "@/components/DashboardClient";
import type { UserProfile, Repo } from "@/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/");
  }

  let profile: UserProfile | null = null;
  let repos: Repo[] = [];
  let profileError: string | null = null;

  try {
    profile = await fetchUserProfile(session.accessToken);
  } catch (err) {
    profileError = err instanceof Error ? err.message : "Failed to load profile";
  }

  try {
    repos = await fetchAllRepositories(session.accessToken);
  } catch {
    // Repos error is non-blocking; BentoGrid will show empty state
  }

  return (
    <DashboardClient
      repos={repos}
      profile={profile}
      profileError={profileError ?? undefined}
    />
  );
}
