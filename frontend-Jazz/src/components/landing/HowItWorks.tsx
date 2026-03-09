"use client"

import { motion } from "framer-motion"
import { Reveal, SectionHeader } from "./SectionPrimitives"
import { STEPS } from "@/lib/landing-data"
import { useScrollProgress } from "@/hooks/useAnimations"

export default function HowItWorks() {
  const { ref: lineRef, progress } = useScrollProgress()

  return (
    <section id="how-it-works" className="flex flex-col items-center py-24 sm:py-32 px-6 sm:px-8 lg:px-12 scroll-mt-24 bg-white/50">
      <div className="w-full max-w-4xl">
        <SectionHeader
          badge="How It Works"
          title="Three steps to"
          gradient="perfect meeting notes"
          subtitle="No setup, no downloads, no complicated onboarding. Just paste a link and let JazzWall do the rest."
        />

        <div ref={lineRef} className="relative space-y-6">
          {/* Animated connector line that draws as you scroll */}
          <div className="absolute left-[39px] top-[60px] bottom-[60px] w-px hidden sm:block overflow-hidden">
            {/* Static track */}
            <div className="absolute inset-0 bg-zinc-200/40" />
            {/* Animated fill */}
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-amber-300 via-orange-300 to-rose-300"
              style={{ height: `${progress * 100}%` }}
            />
          </div>

          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <motion.div
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="group relative flex items-start gap-6 sm:gap-8 p-7 sm:p-9 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/80 hover:border-amber-200/80 hover:shadow-xl hover:shadow-amber-100/30 transition-[border-color,box-shadow] duration-300"
              >
                <motion.div
                  className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20"
                  whileHover={{
                    scale: 1.12,
                    rotate: 5,
                    transition: { type: "spring", stiffness: 300, damping: 15 }
                  }}
                >
                  <span className="text-base font-bold text-white font-display">{s.step}</span>
                </motion.div>
                <div className="pt-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-2 font-display">{s.title}</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm sm:text-base">{s.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
