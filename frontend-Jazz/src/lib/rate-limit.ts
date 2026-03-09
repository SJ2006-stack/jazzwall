/**
 * Simple in-memory rate limiter for API routes.
 * For production at scale, replace with Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof globalThis !== "undefined") {
  const cleanup = () => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }
  // Only set interval on server
  if (typeof window === "undefined") {
    setInterval(cleanup, 5 * 60 * 1000)
  }
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetInMs: number
}

/**
 * Check rate limit for a given identifier (e.g. IP address).
 * @param identifier - Unique key (IP, user ID, etc.)
 * @param maxRequests - Max requests allowed in the window (default: 10)
 * @param windowMs - Window duration in ms (default: 60_000 = 1 minute)
 */
export function rateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // New window or expired window
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1, resetInMs: windowMs }
  }

  // Within window but under limit
  if (entry.count < maxRequests) {
    entry.count += 1
    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetInMs: entry.resetTime - now,
    }
  }

  // Rate limited
  return {
    success: false,
    remaining: 0,
    resetInMs: entry.resetTime - now,
  }
}
