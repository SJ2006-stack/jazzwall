"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeader({ badge, title, gradient, subtitle }: { badge: string; title: string; gradient: string; subtitle: string }) {
  return (
    <div className="text-center mb-16 sm:mb-20">
      <Reveal>
        <span className="inline-block text-xs uppercase tracking-widest text-amber-600 font-semibold mb-5">
          {badge}
        </span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 mb-6 font-display leading-[1.12]">
          {title}
          <br />
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-400 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-shift">
            {gradient}
          </span>
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </Reveal>
    </div>
  )
}
