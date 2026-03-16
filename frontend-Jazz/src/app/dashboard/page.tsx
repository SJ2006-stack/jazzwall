"use client"

export const runtime = "edge"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Sidebar from "@/components/layout/Sidebar"
import MeetingToken from "@/components/meeting/MeetingToken"
import { useBackendHealth } from "@/hooks/useBackendHealth"
import { supabase } from "@/lib/supabase"

interface Meeting {
  id: string
  title: string | null
  meet_url: string
  status: string
  created_at: string
}

interface Stats {
  totalMeetings: number
  totalActionItems: number
  languages: number
  hoursSaved: string
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const backendHealth = useBackendHealth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [stats, setStats] = useState<Stats>({ totalMeetings: 0, totalActionItems: 0, languages: 0, hoursSaved: "0h" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        // Fetch user's meetings
        const { data: meetingsData } = await supabase
          .from("meetings")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })

        const userMeetings = meetingsData ?? []
        setMeetings(userMeetings)

        // Compute stats
        let actionItemCount = 0
        if (userMeetings.length > 0) {
          const meetingIds = userMeetings.map((m) => m.id)
          const { data: summaries } = await supabase
            .from("summaries")
            .select("action_items")
            .in("meeting_id", meetingIds)

          actionItemCount = (summaries ?? []).reduce(
            (sum, s) => sum + (s.action_items?.length ?? 0),
            0
          )
        }

        const hours = (userMeetings.length * 0.7).toFixed(1)

        setStats({
          totalMeetings: userMeetings.length,
          totalActionItems: actionItemCount,
          languages: userMeetings.length > 0 ? 3 : 0,
          hoursSaved: `${hours}h`,
        })
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, user])

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })

    if (diffDays === 0) return `Today, ${time}`
    if (diffDays === 1) return `Yesterday, ${time}`
    return `${d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${time}`
  }
  return (
    <div className="flex h-screen bg-[#FAF9F7] text-zinc-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-[#FAF9F7]/80 backdrop-blur-xl px-6 sm:px-8 lg:px-12 py-5">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Your meeting notes & insights</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Meeting
            </Link>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          {backendHealth === "error" && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600">
              Backend is temporarily unavailable. Please try again in a moment.
            </div>
          )}

          <div className="mb-6">
            <MeetingToken />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Meetings", value: String(stats.totalMeetings), change: stats.totalMeetings > 0 ? `${stats.totalMeetings} recorded` : "No meetings yet", color: "text-amber-400" },
              { label: "Hours Saved", value: stats.hoursSaved, change: stats.totalMeetings > 0 ? "↑ Estimated" : "—", color: "text-emerald-400" },
              { label: "Action Items", value: String(stats.totalActionItems), change: stats.totalActionItems > 0 ? `${stats.totalActionItems} total` : "None yet", color: "text-amber-400" },
              { label: "Languages", value: String(stats.languages), change: stats.languages > 0 ? "Hindi, EN, HG" : "—", color: "text-orange-400" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl bg-white border border-zinc-200/80 p-5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100 transition-all duration-200"
              >
                <p className="text-2xl font-bold text-zinc-900 mb-0.5">{stat.value}</p>
                <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                <p className={`text-[10px] mt-2 font-medium ${stat.color}`}>{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Recent Meetings
            </h2>
            <div className="flex-1 h-px bg-zinc-200" />
            <div className="flex items-center gap-2">
              {["All", "This week", "Flagged"].map((f, i) => (
                <button
                  key={f}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    i === 0
                      ? "bg-zinc-100 text-zinc-800"
                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting list */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-200/60 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 bg-zinc-100 rounded-full" />
                    <div className="h-2 w-1/2 bg-zinc-50 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            /* ── Empty state for new users ── */
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">No meetings yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                Start your first meeting to see transcripts, AI summaries, and action items appear here automatically.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                </svg>
                Start your first meeting
              </Link>
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {meetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/meeting/${meeting.id}`}
                  className="
                    group flex items-center gap-4 p-4
                    rounded-xl bg-white border border-zinc-200/60
                    hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-100
                    transition-all duration-200
                  "
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100/80 transition-colors">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 group-hover:text-black transition-colors truncate">
                      {meeting.title || "Untitled Meeting"}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatDate(meeting.created_at)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${
                    meeting.status === "active"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-zinc-100 text-zinc-500 border-zinc-200"
                  }`}>
                    {meeting.status === "active" ? "Live" : "Completed"}
                  </span>

                  {/* Arrow */}
                  <svg
                    className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          {/* Quick tip — only for returning users */}
          {meetings.length > 0 && (
            <div className="mt-8 text-center py-8 rounded-2xl border border-dashed border-zinc-200">
              <p className="text-sm text-zinc-400 mb-3">Ready for another meeting?</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-semibold border border-amber-100 hover:bg-amber-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                </svg>
                Start a new meeting
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}