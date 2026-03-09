import { useEffect, useState, useRef } from "react"
import { useInView } from "framer-motion"

export function useCountUp(target: number, duration = 2000) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    let start = 0
    const durationMs = typeof duration === "number" && duration < 100 ? duration * 1000 : duration
    const increment = target / (durationMs / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration, inView])

  return { ref, count, inView }
}

export function useScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const visible = Math.max(0, windowHeight - rect.top)
      const total = rect.height + windowHeight
      setProgress(Math.min(1, visible / total))
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return { ref, progress }
}