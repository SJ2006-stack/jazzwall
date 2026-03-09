"use client"

import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"

function getRelativeDate(daysAgo: number): string {
  if (daysAgo === 0) return "Today"
  if (daysAgo === 1) return "Yesterday"
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

const recentMeetings = [
  {
    id: "demo-1",
    title: "Product Standup",
    date: `${getRelativeDate(0)}, 10:30 AM`,
    duration: "32 min",
    participants: 4,
    language: "Hinglish",
    actionItems: 3,
  },
  {
    id: "demo-2",
    title: "Investor Update Call",
    date: `${getRelativeDate(1)}, 3:00 PM`,
    duration: "48 min",
    participants: 6,
    language: "English",
    actionItems: 5,
  },
  {
    id: "demo-3",
    title: "Sprint Planning",
    date: `${getRelativeDate(2)}, 11:00 AM`,
    duration: "55 min",
    participants: 8,
    language: "Hindi",
    actionItems: 7,
  },
  {
    id: "demo-4",
    title: "Design Review",
    date: `${getRelativeDate(3)}, 2:00 PM`,
    duration: "28 min",
    participants: 3,
    language: "Hinglish",
    actionItems: 2,
  },
]

export default function DashboardPage() {
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
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Meetings", value: "12", change: "+3 this week", color: "text-amber-400" },
              { label: "Hours Saved", value: "8.5h", change: "↑ 24%", color: "text-emerald-400" },
              { label: "Action Items", value: "34", change: "8 pending", color: "text-amber-400" },
              { label: "Languages", value: "3", change: "Hindi, EN, HG", color: "text-orange-400" },
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
          <div className="space-y-2 stagger-children">
            {recentMeetings.map((meeting) => (
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
                    {meeting.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {meeting.date} · {meeting.duration} · {meeting.participants} people
                  </p>
                </div>

                {/* Action items count */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-emerald-500/60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[11px] text-zinc-500 font-medium">{meeting.actionItems}</span>
                </div>

                {/* Language badge */}
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 flex-shrink-0">
                  {meeting.language}
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

          {/* Empty state hint */}
          <div className="mt-8 text-center py-8 rounded-2xl border border-dashed border-zinc-200">
            <p className="text-sm text-zinc-400 mb-3">Want to see JazzWall in action?</p>
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
        </div>
      </main>
    </div>
  )
}