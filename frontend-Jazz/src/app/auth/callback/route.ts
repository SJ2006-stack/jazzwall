import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"

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
