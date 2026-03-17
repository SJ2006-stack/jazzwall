import { z } from "zod"

/**
 * Server-side environment variables schema.
 * Validated when API routes run.
 */
const serverSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

/**
 * Client-side environment variables schema.
 * These must all be prefixed with NEXT_PUBLIC_.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("https://jazzwall.ai"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
})

// ── Server env validation (only runs on server) ──
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() should only be called on the server")
  }

  const result = serverSchema.safeParse(process.env)

  if (!result.success) {
    const missing = Object.keys(result.error.flatten().fieldErrors).join(", ")
    console.error(`❌ Missing server env vars: ${missing}`)
    // In development, warn. In production, throw.
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required server environment variables: ${missing}`)
    }
    return null
  }

  return result.data
}

// ── Client env validation ──
export function getClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://jazzwall.ai",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://jazzwall-production.up.railway.app",
  }

  const result = clientSchema.safeParse(clientEnv)

  if (!result.success) {
    console.warn("⚠️ Client env validation failed:", result.error.flatten().fieldErrors)
    return { NEXT_PUBLIC_SITE_URL: "https://jazzwall.ai" }
  }

  return result.data
}

/**
 * The canonical site URL.
 * Uses NEXT_PUBLIC_SITE_URL if set, otherwise defaults to jazzwall.ai.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jazzwall.ai"
