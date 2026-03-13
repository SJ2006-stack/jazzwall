"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useUser, SignInButton } from "@clerk/nextjs"

const CHROME_WEB_STORE_URL = "https://chrome.google.com/webstore/detail/jazzwall-extension-placeholder"

export default function MeetingInput() {
  const { isSignedIn } = useUser()
  const [link, setLink] = useState("")

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

        {/* Extension install button */}
        {isSignedIn ? (
          <motion.a
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="
              relative px-6 py-3.5
              bg-zinc-900 text-white
              rounded-xl
              text-sm font-semibold
              hover:bg-zinc-800 active:bg-zinc-700
              transition-colors duration-150
              shadow-sm cursor-pointer
              flex items-center justify-center gap-2
              w-full sm:w-auto
            "
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l2.385 4.83 5.33.774-3.858 3.761.91 5.308L12 15.918l-4.767 2.505.91-5.308L4.285 9.354l5.33-.774L12 3.75z" />
            </svg>
            Install JazzWall Extension
          </motion.a>
        ) : (
          <SignInButton mode="modal">
            <motion.button
              className="
                relative px-6 py-3.5
                bg-zinc-900 text-white
                rounded-xl
                text-sm font-semibold
                hover:bg-zinc-800 active:bg-zinc-700
                transition-colors duration-150
                shadow-sm cursor-pointer
                flex items-center justify-center gap-2
                w-full sm:w-auto
              "
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25m0 0H12m3.75 0l-3 3m-3.75 5.25a3 3 0 013-3h7.5a3 3 0 013 3v7.5a3 3 0 01-3 3h-7.5a3 3 0 01-3-3V13.5z" />
              </svg>
              Sign in to install extension
            </motion.button>
          </SignInButton>
        )}
      </div>

      <motion.p
        className="text-xs text-zinc-500 mt-3 text-center sm:text-left"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        Install JazzWall Extension to start recording. After installing, open Google Meet, start recording from the extension popup, and then track live transcript in your dashboard.
      </motion.p>

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
    </>
  )
}
