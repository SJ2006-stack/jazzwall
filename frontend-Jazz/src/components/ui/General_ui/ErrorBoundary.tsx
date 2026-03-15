"use client"

import { useEffect } from "react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
