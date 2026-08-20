export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#080a16] flex flex-col items-center justify-center relative overflow-hidden text-slate-100">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center p-8 rounded-3xl border border-emerald-500/20 bg-[#0d1224]/90 backdrop-blur-2xl shadow-2xl max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
        <h3 className="text-base font-bold text-white mb-1">Admin Portal</h3>
        <p className="text-xs text-slate-400 animate-pulse">Verifying master owner credentials...</p>
      </div>
    </div>
  );
}
