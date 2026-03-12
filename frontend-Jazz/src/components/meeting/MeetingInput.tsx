"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { useUser, useAuth, SignInButton } from "@clerk/nextjs"

export default function MeetingInput() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleStart() {
    if (!isSignedIn) return

    setLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        throw new Error("Backend API URL is not configured. Please set NEXT_PUBLIC_API_URL.")
      }

      const meetingId = crypto.randomUUID()
      const token = await getToken()

      // Fire bot join in background — don't await
      fetch(`${apiUrl}/api/bot/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          meetingUrl: link.trim(),
          userId: user?.id,
          meetingId
        })
      })

      // Redirect immediately — bot joins in background
      router.push(`/meeting/${meetingId}`)

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const isValidLink = /meet\.google\.com\/[a-z]/.test(link.trim())
  const showFormatHint = link.trim().length > 0 && !isValidLink

  return (
    <>
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xl mx-auto">
        {/* Input container */}
        <div className="relative flex-1 group">
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-200/40 to-orange-200/40 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isValidLink ? 0.6 : 0 }}
            transition={{ duration: 0.4 }}
          />
          <input
            type="text"
            placeholder="Paste your Google Meet link…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isValidLink && handleStart()}
            disabled={loading}
            className="
              relative w-full px-5 py-3.5
              bg-white backdrop-blur-sm
              border border-zinc-300
              rounded-xl
              text-sm text-zinc-900 placeholder:text-zinc-400
              outline-none
              focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15
              transition-all duration-200
              shadow-sm
              disabled:opacity-60
            "
          />
        </div>

        {/* Start button */}
        {isSignedIn ? (
          <motion.button
            onClick={handleStart}
            disabled={!isValidLink || loading}
            className="
              relative px-6 py-3.5
              bg-zinc-900 text-white
              rounded-xl
              text-sm font-semibold
              hover:bg-zinc-800 active:bg-zinc-700
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-150
              shadow-sm cursor-pointer
              flex items-center justify-center gap-2
              w-full sm:w-auto
            "
            whileHover={isValidLink ? { scale: 1.04 } : {}}
            whileTap={isValidLink ? { scale: 0.97 } : {}}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
            )}
            {loading ? "Starting…" : "Start"}
          </motion.button>
        ) : (
          <SignInButton mode="modal">
            <motion.button
              disabled={!isValidLink}
              className="
                relative px-6 py-3.5
                bg-zinc-900 text-white
                rounded-xl
                text-sm font-semibold
                hover:bg-zinc-800 active:bg-zinc-700
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-150
                shadow-sm cursor-pointer
                flex items-center justify-center gap-2
                w-full sm:w-auto
              "
              whileHover={isValidLink ? { scale: 1.04 } : {}}
              whileTap={isValidLink ? { scale: 0.97 } : {}}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Start
            </motion.button>
          </SignInButton>
        )}
      </div>

      {/* Format hint */}
      {showFormatHint && (
        <motion.p
          className="text-xs text-amber-600 mt-2 text-center sm:text-left"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          Please enter a valid Google Meet link (e.g. meet.google.com/abc-defg-hij)
        </motion.p>
      )}

      {/* API error */}
      {error && (
        <motion.p
          className="text-xs text-red-500 mt-2 text-center sm:text-left"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </>
  )
}
