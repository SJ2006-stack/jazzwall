"use client"

import { motion } from "framer-motion"

export default function Hero() {
  return (
    <div className="relative flex flex-col items-center text-center max-w-4xl mx-auto">
      {/* Floating ambient particles */}
      <div className="pointer-events-none absolute inset-0 -inset-x-32 overflow-hidden">
        <motion.div
          className="absolute top-12 left-[8%] w-2 h-2 rounded-full bg-amber-400/30"
          animate={{ y: [-8, 8, -8], x: [-4, 4, -4], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-[12%] w-3 h-3 rounded-full bg-orange-300/25"
          animate={{ y: [6, -10, 6], x: [3, -3, 3], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.div
          className="absolute bottom-24 left-[15%] w-1.5 h-1.5 rounded-full bg-rose-400/30"
          animate={{ y: [-6, 10, -6], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
        <motion.div
          className="absolute top-[45%] right-[6%] w-2.5 h-2.5 rounded-full bg-amber-300/20"
          animate={{ y: [4, -12, 4], x: [-2, 5, -2], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-16 right-[20%] w-1.5 h-1.5 rounded-full bg-orange-400/25"
          animate={{ y: [-4, 8, -4], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-[12px] font-semibold text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Now in Early Access
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06] font-display"
      >
        <span className="text-zinc-900">
          AI meeting notes for
        </span>
        <br />
        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-shift">
          how India actually speaks
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mt-7 text-base sm:text-lg md:text-xl text-zinc-500 font-normal max-w-xl leading-relaxed"
      >
        Paste a Google Meet link. Get real-time transcripts, AI summaries,
        and action items — in Hindi, English, or Hinglish.
      </motion.p>

      {/* Language badges */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 flex flex-wrap justify-center items-center gap-2.5"
      >
        {["Hindi", "English", "Hinglish", "Marathi", "Tamil"].map((lang, i) => (
          <motion.span
            key={lang}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.55 + i * 0.06 }}
            whileHover={{ scale: 1.08, y: -2 }}
            className="px-4 py-1.5 text-xs font-medium rounded-full bg-white/80 text-zinc-600 border border-zinc-200/80 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50/60 transition-colors duration-200 cursor-default"
          >
            {lang}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
