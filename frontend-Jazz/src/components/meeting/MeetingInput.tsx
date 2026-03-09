"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import GoogleAuthModal from "@/components/landing/GoogleAuthModal"

export default function MeetingInput() {
  const router = useRouter()
  const { user } = useAuth()
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  function handleStart() {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    setLoading(true)
    const meetingId = crypto.randomUUID()
    router.push(`/meeting/${meetingId}`)
  }

  function handleAuthSuccess() {
    setAuthModalOpen(false)
    // After auth, auto-start if link is present
    if (link.trim().length > 0) {
      setLoading(true)
      const meetingId = crypto.randomUUID()
      router.push(`/meeting/${meetingId}`)
    }
  }

  const isValidLink = /meet\.google\.com\/[a-z]/.test(link.trim())
  const showFormatHint = link.trim().length > 0 && !isValidLink

  return (
    <>
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xl mx-auto">
        {/* Input container with glass effect */}
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
            "
          />
        </div>

        {/* Start button */}
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
            shadow-sm
            cursor-pointer
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
          Start
        </motion.button>
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

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}