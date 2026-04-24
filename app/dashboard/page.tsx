import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchUserProfile, fetchAllRepositories } from "@/lib/github";
import SignOutButton from "@/components/SignOutButton";
import DashboardClient from "@/components/DashboardClient";
import GistSyncToggle from "@/components/GistSyncToggle";
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">RepoPulse</h1>
        <div className="flex items-center gap-4">
          <GistSyncToggle />
          <SignOutButton />
        </div>
      </header>

      <DashboardClient
        repos={repos}
        profile={profile}
        profileError={profileError ?? undefined}
      />
    </div>
  );
}
