export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white animate-pulse">
      {/* Header skeleton */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="h-6 w-28 rounded bg-gray-800" />
        <div className="h-8 w-20 rounded bg-gray-800" />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Profile skeleton */}
        <section className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-gray-800" />
            <div className="h-4 w-24 rounded bg-gray-800" />
            <div className="h-4 w-64 rounded bg-gray-800" />
          </div>
        </section>

        {/* Stat cards skeleton */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-900 border border-gray-800 px-4 py-5 space-y-2">
              <div className="h-4 w-16 rounded bg-gray-800" />
              <div className="h-7 w-12 rounded bg-gray-800" />
            </div>
          ))}
        </section>

        {/* Repo grid skeleton */}
        <section className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-900 border border-gray-800 p-5 space-y-3">
              <div className="h-5 w-3/4 rounded bg-gray-800" />
              <div className="h-4 w-full rounded bg-gray-800" />
              <div className="h-4 w-2/3 rounded bg-gray-800" />
              <div className="flex gap-4 pt-2">
                <div className="h-4 w-12 rounded bg-gray-800" />
                <div className="h-4 w-12 rounded bg-gray-800" />
                <div className="h-4 w-12 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
