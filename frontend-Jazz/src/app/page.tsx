"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/layout/Navbar"
import Hero from "@/components/landing/Hero"
import MeetingInput from "@/components/meeting/MeetingInput"
import ProductPreview from "@/components/landing/ProductPreview"
import SocialProof from "@/components/landing/SocialProof"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorks from "@/components/landing/HowItWorks"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import PricingSection from "@/components/landing/PricingSection"
import FaqSection from "@/components/landing/FaqSection"
import FinalCta from "@/components/landing/FinalCta"
import Footer from "@/components/layout/Footer"


export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show scroll-to-top button after scrolling
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className={`relative min-h-screen bg-[#FAF9F7] text-zinc-900 ${mounted ? "" : "page-ready"}`}>
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
        Skip to main content
      </a>

      <Navbar />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="main-content" className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden pt-32 pb-32 sm:pb-44">
        {/* Animated ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-amber-100/50 blur-[140px]"
            animate={{ scale: [1, 1.06, 1], x: ["-50%", "-47%", "-53%", "-50%"], opacity: [0.5, 0.65, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-orange-100/30 blur-[120px]"
            animate={{ scale: [1, 1.1, 1], y: [0, -20, 0], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-rose-100/20 blur-[100px]"
            animate={{ scale: [1, 1.08, 1], x: [0, 15, 0], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </div>

        {/* Subtle animated grid */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "72px 72px" }}
          animate={{ opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col items-center w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Hero />

          {/* Meeting Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-12 w-full max-w-xl mx-auto"
          >
            <MeetingInput />
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-14 flex flex-col items-center gap-5"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-400/80 font-medium">
              Works with your favorite tools
            </p>
            <div className="flex items-center gap-8 sm:gap-10 text-zinc-400">
              {[
                { name: "Google Meet", icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M14.5 10.5V7.5L19 4.5V19.5L14.5 16.5V13.5" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="6" width="11.5" height="12" rx="2" fill="#00832d" fillOpacity="0.15" stroke="#00832d" strokeWidth="1.5"/>
                    <path d="M6.5 10L8.5 12L11 9.5" stroke="#00832d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { name: "Zoom (soon)", icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="15" height="14" rx="3" fill="#2D8CFF" fillOpacity="0.15" stroke="#2D8CFF" strokeWidth="1.5"/>
                    <path d="M17 10L22 7V17L17 14" stroke="#2D8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { name: "Teams (soon)", icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="12" height="14" rx="2" fill="#5059C9" fillOpacity="0.15" stroke="#5059C9" strokeWidth="1.5"/>
                    <path d="M7 11H13M7 14H11" stroke="#5059C9" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="19" cy="8" r="3" fill="#5059C9" fillOpacity="0.15" stroke="#5059C9" strokeWidth="1.3"/>
                    <path d="M17 13H21C21.5523 13 22 13.4477 22 14V17C22 17.5523 21.5523 18 21 18H17" stroke="#5059C9" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                )}
              ].map((tool) => (
                <span
                  key={tool.name}
                  className="flex items-center gap-2.5 text-xs font-medium hover:text-zinc-600 transition-colors"
                >
                  {tool.icon}
                  {tool.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF9F7] to-transparent pointer-events-none" />
      </section>

      <ProductPreview />
      <SocialProof />

      {/* Soft gradient transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />

      <FeaturesSection />
      <HowItWorks />

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200/50 to-transparent" />

      <TestimonialsSection />
      <PricingSection />

      <div className="h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />

      <FaqSection />
      <FinalCta />
      <Footer />

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
