"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reveal, SectionHeader } from "./SectionPrimitives"
import { FAQS } from "@/lib/landing-data"

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      className={`rounded-2xl border transition-[border-color,box-shadow,background-color] duration-200 ${open ? "bg-white border-amber-200/60 shadow-lg shadow-amber-100/20" : "bg-white/60 border-zinc-200/80 hover:border-zinc-300"}`}
      whileHover={!open ? { y: -2 } : {}}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold text-zinc-900 pr-4">{question}</span>
        <motion.svg
          className="w-5 h-5 text-zinc-400 shrink-0"
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-zinc-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FaqSection() {
  return (
    <section id="faq" className="flex flex-col items-center py-24 sm:py-32 px-6 sm:px-8 lg:px-12 scroll-mt-24">
      <div className="w-full max-w-3xl">
        <SectionHeader
          badge="FAQ"
          title="Got questions?"
          gradient="We've got answers"
          subtitle="Everything you need to know about JazzWall."
        />

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <FaqItem question={faq.q} answer={faq.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
