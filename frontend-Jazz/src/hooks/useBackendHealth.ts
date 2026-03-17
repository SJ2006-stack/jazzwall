import { useState, useEffect } from "react"

export function useBackendHealth() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking")

  useEffect(() => {
    const check = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://jazzwall-production.up.railway.app"
        const res = await fetch(`${apiUrl}/health`)
        const ct = res.headers.get('content-type') ?? ''
        if (!ct.includes('application/json')) {
          setStatus('error')
          return
        }
        setStatus(res.ok ? 'ok' : 'error')
      } catch {
        setStatus('error')
      }
    }

    check()
    const interval = setInterval(check, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return status
}
