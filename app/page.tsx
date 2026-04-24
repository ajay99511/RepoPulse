import SignInButton from "@/components/SignInButton";

interface HomeProps {
  searchParams: { error?: string };
}

export default function Home({ searchParams }: HomeProps) {
  const hasError = Boolean(searchParams.error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Logo / App name */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-bold text-white shadow-lg">
            R
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            RepoPulse
          </h1>
          <p className="max-w-sm text-gray-400">
            Your personal GitHub repository dashboard. Browse, search, and
            organize all your repos in one place.
          </p>
        </div>

        {/* Error message */}
        {hasError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
            Authentication failed. Please try again.
          </div>
        )}

        <SignInButton />
      </div>
    </main>
  );
}
