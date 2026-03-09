"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import GoogleAuthModal from "@/components/landing/GoogleAuthModal"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
]

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
        setMenuOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Click outside to close dropdown
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", onClick)
    }
    return () => document.removeEventListener("mousedown", onClick)
  }, [menuOpen])

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
            <div className="hidden sm:flex items-center">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" />
              ) : user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-zinc-100 transition-all duration-150 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-zinc-700 font-medium max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <svg className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white border border-zinc-200/80 shadow-xl shadow-zinc-900/[0.08] py-1 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-zinc-100">
                          <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                          </svg>
                          Dashboard
                        </Link>
                        <button
                          onClick={() => { signOut(); setMenuOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:text-red-600 hover:bg-red-50/80 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[13px] font-semibold hover:bg-zinc-800 transition-colors duration-150 shadow-sm cursor-pointer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get Started
                </motion.button>
              )}
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
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-[15px] font-medium text-zinc-700 hover:bg-zinc-50 transition-all"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false) }}
                      className="px-4 py-3 rounded-xl text-[15px] font-medium text-left text-red-600 hover:bg-red-50/80 transition-all cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }}
                    className="w-full py-3 rounded-xl bg-zinc-900 text-white text-[15px] font-semibold hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </>
  )
}
