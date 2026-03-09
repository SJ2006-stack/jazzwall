import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <h1 className="text-8xl sm:text-9xl font-bold font-display bg-gradient-to-r from-amber-500 via-orange-500 to-rose-400 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4 font-display">
          Page not found
        </h2>
        <p className="text-zinc-500 mb-10 leading-relaxed">
          Sorry, we couldn&apos;t find what you&apos;re looking for. 
          The page may have been moved or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  )
}
