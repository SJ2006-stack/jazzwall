"use client"

import { motion } from "framer-motion"
import { Reveal } from "./SectionPrimitives"
import MeetingInput from "@/components/meeting/MeetingInput"

export default function FinalCta() {
  return (
    <section className="relative flex flex-col items-center py-28 sm:py-36 px-6 sm:px-8 lg:px-12 overflow-hidden">
      {/* Animated ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-amber-100/40 blur-[140px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating accent shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-amber-400/20"
          animate={{ y: [-8, 10, -8], x: [0, 6, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[12%] w-4 h-4 rounded-full bg-orange-300/15"
          animate={{ y: [6, -8, 6], x: [-3, 3, -3], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-[35%] right-[18%] w-2 h-2 rounded-full bg-rose-400/20"
          animate={{ y: [-5, 7, -5], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
      </div>

      <Reveal>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-6 font-display leading-[1.12]">
            Ready to stop
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-400 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-shift">
              taking notes?
            </span>
          </h2>
          <p className="text-zinc-500 mb-12 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            Join the growing list of Indian teams saving hours every week with AI-powered meeting notes.
          </p>
          <div className="max-w-md mx-auto">
            <MeetingInput />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
