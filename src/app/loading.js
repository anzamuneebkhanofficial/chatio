export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#080a16] flex flex-col items-center justify-center relative overflow-hidden text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Modern Loader Card */}
      <div className="relative z-10 flex flex-col items-center p-8 sm:p-10 rounded-3xl border border-indigo-500/20 bg-[#0d1224]/90 backdrop-blur-2xl shadow-2xl shadow-indigo-950/80 max-w-sm w-full mx-4 text-center">
        {/* Animated Gradient Spinner Ring */}
        <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 border-r-violet-500 animate-spin" />
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/40 animate-pulse">
            C
          </div>
        </div>

        <h3 className="text-lg font-bold text-white font-display tracking-tight mb-1">
          Chatio AI
        </h3>
        <p className="text-xs text-slate-400 font-medium animate-pulse">
          Loading workspace...
        </p>

        {/* Shimmer Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
