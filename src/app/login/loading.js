export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080a16] p-4 sm:p-6 lg:p-8 relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Horizontal Widescreen Skeleton Card */}
      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-indigo-500/25 bg-[#0d1224]/98 backdrop-blur-2xl shadow-2xl shadow-indigo-950/70 overflow-hidden min-h-[480px]">
        {/* Left Side Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950/70 via-[#0d1224] to-[#080a16] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div className="space-y-4">
            <div className="w-28 h-8 bg-white/10 rounded-lg animate-pulse" />
            <div className="w-48 h-6 bg-white/20 rounded animate-pulse pt-2" />
            <div className="w-64 h-3 bg-white/10 rounded animate-pulse" />
            <div className="space-y-2 pt-4">
              <div className="w-56 h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-52 h-4 bg-white/10 rounded animate-pulse" />
              <div className="w-48 h-4 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Right Side Form Skeleton */}
        <div className="md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-sm font-semibold text-white">Loading secure sign in...</p>
            <div className="w-full space-y-3 pt-4">
              <div className="h-11 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
              <div className="h-12 bg-indigo-600/30 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
