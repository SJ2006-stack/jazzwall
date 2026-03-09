"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useCallback } from "react"

export interface User {
  name: string
  email: string
  avatar: string
}

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut: clerkSignOut, openSignIn } = useClerk()

  const user: User | null = clerkUser
    ? {
        name: clerkUser.fullName ?? clerkUser.firstName ?? clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "User",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        avatar: clerkUser.imageUrl ?? "",
      }
    : null

  const loading = !isLoaded

  const signInWithGoogle = useCallback(() => {
    openSignIn({
      forceRedirectUrl: "/dashboard",
    })
  }, [openSignIn])

  const signOut = useCallback(async () => {
    await clerkSignOut({ redirectUrl: "/" })
  }, [clerkSignOut])

  return { user, loading, signInWithGoogle, signOut }
}
