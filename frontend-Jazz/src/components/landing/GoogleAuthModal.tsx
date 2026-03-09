"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: Props) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      // Supabase OAuth redirects the browser, so onSuccess won't fire here.
      // If we reach this line (e.g. popup mode), close the modal.
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            <div className="rounded-3xl bg-white border border-zinc-200 shadow-2xl shadow-zinc-300/40 overflow-hidden">
              {/* Header */}
              <div className="px-10 pt-10 pb-3">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <span className="text-lg font-black text-white">J</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900">Sign in to JazzWall</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">Connect your Google account to start</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-10 pb-10">
                <p className="text-base text-zinc-500 mb-8 leading-relaxed">
                  We need Google access to join your meetings and transcribe them in real-time. 
                  Your data stays private and encrypted.
                </p>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Sign-In Button */}
                <motion.button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="
                    w-full flex items-center justify-center gap-3
                    px-6 py-4 rounded-xl
                    bg-white text-zinc-900
                    font-semibold text-base
                    border border-zinc-300
                    hover:bg-zinc-50 active:bg-zinc-100
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-150
                    shadow-sm
                    cursor-pointer
                  "
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {loading ? "Redirecting…" : "Continue with Google"}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-px bg-zinc-200" />
                  <span className="text-xs text-zinc-400 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-zinc-200" />
                </div>

                {/* Skip for now */}
                <button
                  onClick={onClose}
                  className="
                    w-full px-5 py-3 rounded-xl
                    bg-zinc-100 border border-zinc-200
                    text-sm text-zinc-500 font-medium
                    hover:bg-zinc-200 hover:text-zinc-700
                    transition-all duration-150
                    cursor-pointer
                  "
                >
                  Skip for now
                </button>

                {/* Fine print */}
                <p className="mt-5 text-[10px] text-zinc-400 text-center leading-relaxed">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-zinc-600 transition-colors">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline hover:text-zinc-600 transition-colors">Privacy Policy</Link>.
                  <br />
                  We only access your calendar — never your emails.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
