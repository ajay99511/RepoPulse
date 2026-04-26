import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInButton from "@/components/SignInButton";
import { Activity } from "lucide-react";

interface HomeProps {
  searchParams: { error?: string };
}

export default async function Home({ searchParams }: HomeProps) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  const hasError = Boolean(searchParams.error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Logo / App name */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">RepoPulse</h1>
          <p className="max-w-sm text-sm sm:text-base text-muted-foreground">
            The Zero-Friction Dashboard for managing GitHub repositories.
            Browse, search, and organize all your repos in one place.
          </p>
        </div>

        {/* Error message */}
        {hasError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-5 py-3 text-sm text-destructive-foreground">
            Authentication failed. Please try again.
          </div>
        )}

        <SignInButton />
      </div>
    </main>
  );
}
