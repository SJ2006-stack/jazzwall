"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export interface User {
  name: string
  email: string
  avatar: string
}

/** Map a Supabase Auth user to our app's User shape */
function mapUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {}
  return {
    name: meta.full_name ?? meta.name ?? su.email?.split("@")[0] ?? "User",
    email: su.email ?? "",
    avatar: meta.avatar_url ?? meta.picture ?? "",
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null)
      setLoading(false)
    })

    // 2. Listen for auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  /**
   * Insert user into the waitlist table (upsert by email).
   * Called after successful OAuth sign-in from the auth callback.
   */
  const addToWaitlist = useCallback(async (u: User) => {
    const { error } = await supabase.from("waitlist").upsert(
      {
        email: u.email,
        name: u.name,
        provider: "google",
      },
      { onConflict: "email" }
    )
    if (error) console.error("Waitlist upsert failed:", error.message)
  }, [])

  return { user, loading, signInWithGoogle, signOut, addToWaitlist }
}
