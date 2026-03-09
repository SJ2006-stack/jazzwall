"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useCountUp } from "@/hooks/useAnimations"

const STATS = [
  { value: 50, suffix: "+", label: "Early access teams" },
  { value: 1000, suffix: "+", label: "Meetings transcribed", format: true },
  { value: 5, suffix: "+", label: "Languages supported" },
  { value: 2, prefix: "<", suffix: "s", label: "Transcription latency" },
]

function AnimatedStat({ value, suffix, prefix, label, format, delay }: {
  value: number; suffix?: string; prefix?: string; label: string; format?: boolean; delay: number
}) {
  const { ref, count, inView } = useCountUp(value, 1.6)
  const display = format ? count.toLocaleString("en-IN") : count

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <p ref={ref as React.RefObject<HTMLParagraphElement>} className="text-3xl sm:text-4xl font-bold text-zinc-900 font-display tabular-nums">
        {prefix}{display}{suffix}
      </p>
      <p className="text-sm text-zinc-500 mt-1">{label}</p>
    </motion.div>
  )
}

export default function SocialProof() {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, margin: "-40px" })

  return (
    <section ref={sectionRef} className="flex flex-col items-center py-12 sm:py-16 px-6 sm:px-8 lg:px-12 border-y border-zinc-200/40">
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
        {STATS.map((stat, i) => (
          <div key={stat.label} className="contents">
            <AnimatedStat {...stat} delay={i * 0.12} />
            {i < STATS.length - 1 && (
              <motion.div
                className="hidden sm:block w-px h-10 bg-zinc-200"
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
