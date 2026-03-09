export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Logo pulse */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-pulse">
          <span className="text-sm font-black text-white tracking-tight">J</span>
        </div>
        {/* Shimmer bar */}
        <div className="w-32 h-1 rounded-full bg-zinc-200 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-shimmer bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  )
}
