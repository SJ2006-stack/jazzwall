import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

/**
 * After Clerk sign-in, the user can be redirected here to sync their
 * profile into the Supabase waitlist table, then continue to /dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get("next") ?? "/dashboard"

  try {
    const user = await currentUser()

    if (user) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      // Never fail sign-in redirect just because waitlist sync env is missing.
      if (!supabaseUrl || !serviceRoleKey) {
        console.warn("Skipping waitlist sync: missing SUPABASE url/service role env vars")
        return NextResponse.redirect(`${origin}${next}`)
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

      const email = user.emailAddresses[0]?.emailAddress ?? ""
      const name =
        user.fullName ??
        user.firstName ??
        email.split("@")[0] ??
        "User"

      // Upsert into waitlist table using admin client (bypasses RLS)
      await supabaseAdmin.from("waitlist").upsert(
        {
          email,
          name,
          provider: "google",
        },
        { onConflict: "email" }
      )
    }
  } catch (err) {
    console.error("Waitlist sync error:", err)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
