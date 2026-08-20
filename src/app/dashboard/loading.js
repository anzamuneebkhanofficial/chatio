export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#080a16] flex overflow-hidden text-slate-100">
      {/* Sidebar Skeleton */}
      <aside className="hidden lg:flex w-64 bg-[#0d1224] border-r border-white/5 flex-col h-screen shrink-0 p-4">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-2 border-b border-white/5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
            <div className="w-14 h-2.5 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Navigation links skeleton */}
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 bg-white/5 rounded-xl animate-pulse flex items-center px-4 gap-3">
              <div className="w-4 h-4 bg-white/10 rounded" />
              <div className="w-24 h-3 bg-white/10 rounded" />
            </div>
          ))}
        </div>

        {/* User profile skeleton */}
        <div className="p-3 border-t border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
            <div className="w-32 h-2.5 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-[#080a16] shrink-0">
          <div className="w-32 h-5 bg-white/10 rounded-lg animate-pulse" />
          <div className="w-24 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse" />
        </header>

        {/* Dashboard Body Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 max-w-4xl w-full mx-auto">
          {/* Welcome title skeleton */}
          <div className="space-y-2">
            <div className="w-64 h-7 bg-white/15 rounded-lg animate-pulse" />
            <div className="w-96 h-4 bg-white/5 rounded animate-pulse" />
          </div>

          {/* App ID banner skeleton */}
          <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 backdrop-blur-xl h-24 animate-pulse flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-28 h-4 bg-indigo-400/20 rounded" />
              <div className="w-60 h-3 bg-white/10 rounded" />
            </div>
            <div className="w-48 h-9 bg-white/10 rounded-xl" />
          </div>

          {/* Setup checklist skeleton */}
          <div className="space-y-3 pt-2">
            <div className="w-36 h-4 bg-white/15 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-white/5 bg-[#0d1224]/80 h-28 animate-pulse flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/10 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 bg-white/15 rounded" />
                    <div className="w-44 h-3 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
