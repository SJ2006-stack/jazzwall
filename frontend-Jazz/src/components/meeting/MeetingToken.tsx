"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"

export default function MeetingToken() {
  const { getToken } = useAuth()
  const [token, setToken] = useState("")
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expired, setExpired] = useState(false)
  const [error, setError] = useState("")

  const generateToken = useCallback(async () => {
    setLoading(true)
    setExpired(false)
    setError("")

    try {
      const clerkToken = await getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Token generation failed")

      setToken(data.token)
      setExpiresAt(new Date(data.expiresAt))
      setTimeLeft(300)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Token generation failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (!expiresAt) return

    const interval = setInterval(() => {
      const remaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      if (remaining <= 0) {
        setTimeLeft(0)
        setExpired(true)
        clearInterval(interval)
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const copyToken = async () => {
    if (!token) return
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeLeft > 120) return "text-green-600"
    if (timeLeft > 60) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="w-full max-w-md p-5 bg-white rounded-2xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Meeting Token</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Paste this in your JazzWall extension</p>
        </div>

        {token && !expired && (
          <motion.div
            className={`text-2xl font-mono font-bold ${getTimerColor()}`}
            animate={{ scale: timeLeft <= 30 ? [1, 1.08, 1] : 1 }}
            transition={{ repeat: timeLeft <= 30 ? Infinity : 0, duration: 0.6 }}
          >
            {formatTime(timeLeft)}
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {token && !expired ? (
          <motion.div
            key="token"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 mb-4"
          >
            <code className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 font-mono truncate">
              {token}
            </code>
            <button
              onClick={copyToken}
              className="px-3 py-2.5 bg-zinc-900 text-white text-xs rounded-lg hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </motion.div>
        ) : expired ? (
          <motion.div
            key="expired"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-xs text-red-600 font-medium">Token expired. Generate a new one to continue.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <button
        onClick={generateToken}
        disabled={loading || (!!token && !expired && timeLeft > 0)}
        className="
          w-full py-2.5 rounded-xl text-sm font-semibold
          bg-amber-500 text-white
          hover:bg-amber-400
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-150
        "
      >
        {loading ? "Generating..." : expired ? "Regenerate Token" : token ? "Token Active" : "Generate Meeting Token"}
      </button>

      {token && !expired && (
        <div className="mt-3 h-1 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500 rounded-full"
            animate={{ width: `${(timeLeft / 300) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      )}
    </div>
  )
}
