"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

import SummaryPanel from "@/components/ui/Meeting_ui/SummaryPanel"
import ActionItems from "@/components/ui/Meeting_ui/ActionItems"
import TranscriptChunk from "@/components/ui/Meeting_ui/TranscriptChunk"
import RecordingIndicator from "@/components/ui/Meeting_ui/RecordingIndicator"
import ProcessingLoader from "@/components/ui/Meeting_ui/ProcessingLoader"
import CopyButton from "@/components/ui/General_ui/CopyButton"
import { supabase } from "@/lib/supabase"

interface TranscriptEntry {
  speaker: string
  text: string
  timestamp: string
}

interface MeetingData {
  id: string
  title: string | null
  meet_url: string
  status: string
  created_at: string
  user_id: string
}

export default function MeetingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const meetingId = typeof params.id === "string" ? params.id : ""
  const scrollRef = useRef<HTMLDivElement>(null)

  const [meeting, setMeeting] = useState<MeetingData | null>(null)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [summary, setSummary] = useState<string>("")
  const [actionItems, setActionItems] = useState<string[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [notFound, setNotFound] = useState(false)

  /* ── Fetch meeting + transcript + summary from Supabase ── */
  useEffect(() => {
    if (!isLoaded || !user || !meetingId) return

    async function fetchMeeting() {
      try {
        // 1. Fetch meeting row
        const { data: meetingRow, error: meetingErr } = await supabase
          .from("meetings")
          .select("*")
          .eq("id", meetingId)
          .eq("user_id", user!.id)
          .single()

        if (meetingErr || !meetingRow) {
          setNotFound(true)
          setPageLoading(false)
          return
        }

        setMeeting(meetingRow)

        // 2. Fetch transcript chunks
        const { data: chunks } = await supabase
          .from("transcripts")
          .select("speaker, text, timestamp")
          .eq("meeting_id", meetingId)
          .order("created_at", { ascending: true })

        if (chunks && chunks.length > 0) {
          setTranscript(
            chunks.map((c) => ({
              speaker: c.speaker ?? "Speaker",
              text: c.text,
              timestamp: c.timestamp != null ? String(c.timestamp) : "",
            }))
          )
        }

        // 3. Fetch AI summary & action items
        const { data: summaryRow } = await supabase
          .from("summaries")
          .select("summary, action_items")
          .eq("meeting_id", meetingId)
          .single()

        if (summaryRow) {
          setSummary(summaryRow.summary ?? "")
          setActionItems(summaryRow.action_items ?? [])
          setSummaryLoading(false)
        } else if (meetingRow.status === "completed") {
          // Completed meeting but no summary yet
          setSummaryLoading(false)
        }
        // If meeting is active, summaryLoading stays true (still processing)
      } catch (err) {
        console.error("Meeting fetch error:", err)
      } finally {
        setPageLoading(false)
      }
    }

    fetchMeeting()
  }, [isLoaded, user, meetingId])

  /* ── Realtime subscription ── */
  useEffect(() => {
    if (!meetingId) return

    // Subscribe to new transcript chunks
    const transcriptChannel = supabase
      .channel(`transcript-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transcripts",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          const row = payload.new as { speaker: string | null; text: string; timestamp: number | null }
          setTranscript((prev) => [
            ...prev,
            { speaker: row.speaker ?? "Speaker", text: row.text, timestamp: row.timestamp != null ? String(row.timestamp) : "" },
          ])
        }
      )
      .subscribe()

    // Subscribe to summary creation
    const summaryChannel = supabase
      .channel(`summary-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "summaries",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          const row = payload.new as { summary: string | null; action_items: string[] | null }
          setSummary(row.summary ?? "")
          setActionItems(row.action_items ?? [])
          setSummaryLoading(false)
        }
      )
      .subscribe()

    // Subscribe to meeting status change (active → completed)
    const meetingChannel = supabase
      .channel(`meeting-status-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "meetings",
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          const row = payload.new as MeetingData
          setMeeting(row)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(transcriptChannel)
      supabase.removeChannel(summaryChannel)
      supabase.removeChannel(meetingChannel)
    }
  }, [meetingId])

  /* ── Elapsed timer for active meetings ── */
  useEffect(() => {
    if (!meeting || meeting.status !== "active") return
    const interval = setInterval(() => setElapsedTime((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [meeting?.status])

  /* ── Auto-scroll transcript ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [transcript])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const fullTranscriptText = transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n")
  const isActive = meeting?.status === "active"

  /* ── Full-page loading ── */
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAF9F7]">
        <ProcessingLoader message="Loading meeting…" />
      </div>
    )
  }

  /* ── Not found / no access ── */
  if (notFound || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FAF9F7] text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Meeting not found</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-xs">This meeting doesn&apos;t exist or you don&apos;t have access.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#FAF9F7] text-zinc-900 overflow-hidden">

      {/* ── LEFT SIDE — TRANSCRIPT ── */}
      <div className="flex-1 flex flex-col border-r border-zinc-200/80">

        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 bg-[#FAF9F7]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-zinc-900">
                {meeting.title || "Untitled Meeting"}
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate max-w-[200px]">
                {meetingId.slice(0, 8)}…
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isActive ? (
              <RecordingIndicator duration={formatTime(elapsedTime)} />
            ) : (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Transcript area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 bg-[#F5F4F1]/30">
          {transcript.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500">
                {isActive ? "Waiting for audio…" : "No transcript available for this meeting."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {transcript.map((entry, i) => (
                <TranscriptChunk
                  key={i}
                  text={entry.text}
                  speaker={entry.speaker}
                  timestamp={entry.timestamp}
                  isNew={isActive && i === transcript.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="px-6 py-3 border-t border-zinc-200/80 bg-[#FAF9F7]/80 backdrop-blur-md flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            {transcript.length} transcript chunk{transcript.length !== 1 ? "s" : ""}
          </p>
          {transcript.length > 0 && (
            <CopyButton text={fullTranscriptText} label="Copy transcript" />
          )}
        </div>
      </div>

      {/* ── RIGHT SIDE — AI OUTPUT PANEL ── */}
      <div className="w-[400px] xl:w-[440px] flex flex-col bg-[#F5F4F1]/40">

        {/* Panel header */}
        <div className="px-6 py-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-zinc-800">AI Insights</h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {!summaryLoading && !summary && actionItems.length === 0 ? (
            /* No AI output yet */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500">
                {isActive
                  ? "AI summary will appear after the meeting ends."
                  : "No AI summary was generated for this meeting."}
              </p>
            </div>
          ) : (
            <>
              <SummaryPanel summary={summary} loading={summaryLoading} />
              <ActionItems items={actionItems} loading={summaryLoading} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
