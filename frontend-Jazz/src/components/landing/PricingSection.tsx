"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Reveal, SectionHeader } from "./SectionPrimitives"
import { PLANS } from "@/lib/landing-data"

export default function PricingSection() {
  return (
    <section id="pricing" className="flex flex-col items-center py-24 sm:py-32 px-6 sm:px-8 lg:px-12 scroll-mt-24 bg-white/50">
      <div className="w-full max-w-6xl">
        <SectionHeader
          badge="Pricing"
          title="Simple, transparent"
          gradient="pricing for every team"
          subtitle="Start free. Upgrade when you're ready. No credit card required."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {PLANS.map((plan, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{
                  y: -8,
                  transition: { duration: 0.25, ease: "easeOut" },
                }}
                className={`relative rounded-2xl sm:rounded-3xl border transition-[border-color,box-shadow] duration-300 ${
                  plan.highlight
                    ? "bg-zinc-900 text-white border-zinc-800 shadow-2xl shadow-zinc-900/20 scale-[1.02] p-8 sm:p-10"
                    : plan.name === "Enterprise"
                      ? "bg-gradient-to-br from-white to-amber-50/30 border-amber-200/60 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/40 p-7 sm:p-9"
                      : "bg-white border-zinc-200/80 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/40 p-7 sm:p-9"
                }`}
              >
                {plan.highlight && (
                  <motion.span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-1.5 rounded-full shadow-lg shadow-amber-500/25"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Most Popular
                  </motion.span>
                )}
                <h3 className={`text-lg font-semibold mb-3 ${plan.highlight ? "text-white" : "text-zinc-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className={`text-4xl sm:text-5xl font-bold tracking-tight font-display ${plan.highlight ? "text-white" : "text-zinc-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm font-medium ${plan.highlight ? "text-zinc-400" : "text-zinc-400"}`}>
                      /{plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-8 ${plan.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                  {plan.desc}
                </p>
                <ul className="space-y-3.5 mb-10">
                  {plan.features.map((feat, fi) => (
                    <motion.li
                      key={fi}
                      className="flex items-center gap-3 text-sm"
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + fi * 0.06 }}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-amber-500/20" : "bg-amber-50"}`}>
                        <svg className={`w-3 h-3 ${plan.highlight ? "text-amber-400" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className={`${plan.highlight ? "text-zinc-300" : "text-zinc-600"} leading-snug`}>
                        {feat}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                {plan.name === "Enterprise" ? (
                  <motion.a
                    href="mailto:hello@jazzwall.ai?subject=JazzWall Enterprise Inquiry"
                    className="block text-center py-3.5 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.cta}
                  </motion.a>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/dashboard"
                      className={`block text-center py-3.5 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        plan.highlight
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-900 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/20"
                          : "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
