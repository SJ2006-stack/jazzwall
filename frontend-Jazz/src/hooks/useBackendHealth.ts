import { useState, useEffect } from "react"

export function useBackendHealth() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking")

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
        setStatus(res.ok ? "ok" : "error")
      } catch {
        setStatus("error")
      }
    }

    check()
    const interval = setInterval(check, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return status
}
