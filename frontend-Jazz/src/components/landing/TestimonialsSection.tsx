"use client"

import { motion } from "framer-motion"
import { Reveal, SectionHeader } from "./SectionPrimitives"
import { TESTIMONIALS } from "@/lib/landing-data"

export default function TestimonialsSection() {
  return (
    <section className="flex flex-col items-center py-24 sm:py-32 px-6 sm:px-8 lg:px-12">
      <div className="w-full max-w-6xl">
        <SectionHeader
          badge="Early Access Feedback"
          title="Loved by beta testers"
          gradient="across India"
          subtitle="Hear from the teams already testing JazzWall in early access."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{
                  y: -6,
                  rotateX: -2,
                  rotateY: i === 0 ? 2 : i === 2 ? -2 : 0,
                  transition: { duration: 0.25, ease: "easeOut" },
                }}
                style={{ transformPerspective: 800 }}
                className="relative p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-zinc-200/80 hover:border-amber-200/60 hover:shadow-xl hover:shadow-amber-100/40 transition-[border-color,box-shadow] duration-300 h-full"
              >
                {/* Animated quote mark */}
                <motion.div
                  className="text-4xl font-display text-amber-300/60 leading-none mb-4"
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
                >
                  &ldquo;
                </motion.div>
                <p className="text-sm sm:text-[15px] text-zinc-600 leading-relaxed mb-6">{t.quote}</p>
                <div className="flex items-center gap-3 mt-auto">
                  <motion.div
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-[11px] font-bold text-white">{t.name.charAt(0)}</span>
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
                    <p className="text-[12px] text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
