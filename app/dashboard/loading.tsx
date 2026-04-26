export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background text-foreground animate-pulse">
      {/* Sidebar skeleton — hidden on mobile, visible on lg+ */}
      <aside className="w-72 border-r border-border bg-card/30 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
          </div>
        </div>
        <div className="px-5 space-y-2 flex-grow">
          <div className="h-3 w-12 rounded bg-muted mb-3" />
          <div className="h-9 w-full rounded-lg bg-muted" />
          <div className="h-3 w-12 rounded bg-muted mt-6 mb-3" />
          <div className="h-9 w-full rounded-lg bg-muted" />
          <div className="h-9 w-full rounded-lg bg-muted" />
          <div className="h-9 w-full rounded-lg bg-muted" />
        </div>
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex flex-col gap-1">
              <div className="w-20 h-3 rounded bg-muted" />
              <div className="w-14 h-2 rounded bg-muted" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Mobile header skeleton */}
        <div className="sticky top-0 z-30 flex items-center justify-between bg-background border-b border-border px-4 py-3 lg:hidden">
          <div className="w-9 h-9 rounded-lg bg-muted" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-muted" />
            <div className="w-16 h-4 rounded bg-muted" />
          </div>
          <div className="w-8 h-8 rounded-full bg-muted" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8">
          {/* Header skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="h-3 w-32 rounded bg-muted" />
              <div className="h-8 sm:h-10 w-60 sm:w-72 rounded bg-muted" />
              <div className="h-4 w-48 sm:w-64 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="bg-card border rounded-2xl p-3 sm:p-4 space-y-2 sm:min-w-[120px]">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-10 rounded bg-muted" />
              </div>
              <div className="bg-card border rounded-2xl p-3 sm:p-4 space-y-2 sm:min-w-[120px]">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-6 w-10 rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* Filter bar skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="h-11 sm:h-12 flex-grow rounded-xl bg-card/50 border" />
            <div className="flex gap-2 sm:gap-3">
              <div className="h-11 sm:h-12 w-36 rounded-xl bg-card/50 border" />
              <div className="h-11 sm:h-12 w-28 rounded-xl bg-card/50 border" />
            </div>
          </div>

          {/* Repo grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-card border p-5 sm:p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                  <div className="w-8 h-8 rounded bg-muted" />
                </div>
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 rounded bg-muted" />
                  <div className="h-5 w-10 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
