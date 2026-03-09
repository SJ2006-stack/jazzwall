import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    // Auth client (anon key) — exchanges code for a user session
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const meta = data.user.user_metadata ?? {}

      // Admin client (service_role key) — bypasses RLS for waitlist insert
      const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Upsert into waitlist table
      await supabaseAdmin.from("waitlist").upsert(
        {
          email: data.user.email ?? "",
          name: meta.full_name ?? meta.name ?? data.user.email?.split("@")[0] ?? "User",
          provider: "google",
        },
        { onConflict: "email" }
      )

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code exchange fails, redirect to home with an error hint
  return NextResponse.redirect(`${origin}/?error=auth`)
}
