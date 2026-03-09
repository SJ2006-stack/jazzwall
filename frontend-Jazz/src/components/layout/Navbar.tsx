"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Show, SignInButton, UserButton } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  // Escape key to close menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-zinc-900/[0.04] border border-zinc-200/60"
            : "bg-white/50 backdrop-blur-md border border-zinc-200/40"
        } rounded-2xl`}
      >
        <div className="px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.div
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow duration-200"
              whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-black text-white tracking-tight">J</span>
            </motion.div>
            <span className="text-[15px] font-bold text-zinc-900 font-display">
              JazzWall
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all duration-200"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <motion.button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold hover:bg-zinc-800 transition-colors duration-150 shadow-sm cursor-pointer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Get Started
                  </motion.button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all duration-200"
                >
                  Dashboard
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-7 h-7",
                    },
                  }}
                />
              </Show>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 flex flex-col gap-[5px]">
                <span className={`block h-[1.5px] bg-zinc-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
                <span className={`block h-[1.5px] bg-zinc-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0 scale-0" : ""}`} />
                <span className={`block h-[1.5px] bg-zinc-700 rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-zinc-200/60 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col gap-1 mb-4">
                {NAV_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-[15px] font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="border-t border-zinc-100 pt-4">
                <Show when="signed-in">
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-[15px] font-medium text-zinc-700 hover:bg-zinc-50 transition-all"
                    >
                      Dashboard
                    </Link>
                    <div className="px-4 py-3">
                      <UserButton />
                    </div>
                  </div>
                </Show>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 rounded-xl bg-zinc-900 text-white text-[15px] font-semibold hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      Get Started
                    </button>
                  </SignInButton>
                </Show>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
