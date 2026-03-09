"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import SummaryPanel from "@/components/ui/Meeting_ui/SummaryPanel"
import ActionItems from "@/components/ui/Meeting_ui/ActionItems"
import TranscriptChunk from "@/components/ui/Meeting_ui/TranscriptChunk"
import RecordingIndicator from "@/components/ui/Meeting_ui/RecordingIndicator"
import ProcessingLoader from "@/components/ui/Meeting_ui/ProcessingLoader"
import CopyButton from "@/components/ui/General_ui/CopyButton"

interface TranscriptEntry {
  speaker: string
  text: string
  timestamp: string
}

// Demo data - simulates real-time transcript feed
const DEMO_TRANSCRIPT: TranscriptEntry[] = [
  { speaker: "Priya", text: "Welcome everyone to the product meeting. Let's start with the launch timeline.", timestamp: "0:00" },
  { speaker: "Rahul", text: "Haan, so engineering side se — we need about two weeks for the core feature.", timestamp: "0:12" },
  { speaker: "Priya", text: "Two weeks is tight. Marketing ko bhi time chahiye for the go-to-market.", timestamp: "0:28" },
  { speaker: "Ankit", text: "I think we can parallelize. Design team can finalize assets while engineering ships.", timestamp: "0:45" },
  { speaker: "Rahul", text: "Agreed. Let me break down the engineering tasks — backend API is 70% done already.", timestamp: "1:02" },
  { speaker: "Priya", text: "Great. Ankit, can you sync with the content team for launch copy?", timestamp: "1:18" },
  { speaker: "Ankit", text: "Sure. I'll also prepare the investor update deck by Friday.", timestamp: "1:30" },
]

const DEMO_SUMMARY = `The team discussed the upcoming product launch timeline. Engineering estimates two weeks to ship the core feature, with backend API already 70% complete. The team agreed to parallelize — design will finalize assets while engineering ships. Marketing and content teams will work simultaneously on go-to-market materials. An investor update deck will be prepared by Friday.`

const DEMO_ACTION_ITEMS = [
  "Engineering to complete core feature in 2 weeks",
  "Ankit to sync with content team on launch copy",
  "Prepare investor update deck by Friday",
  "Design team to finalize marketing assets",
  "Rahul to share engineering task breakdown",
]

export default function MeetingPage() {
  const params = useParams()
  const meetingId = typeof params.id === "string" ? params.id : ""
  const scrollRef = useRef<HTMLDivElement>(null)

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Simulate real-time transcript streaming
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoading) return

    let index = 0
    const interval = setInterval(() => {
      if (index < DEMO_TRANSCRIPT.length) {
        setTranscript((prev) => [...prev, DEMO_TRANSCRIPT[index]])
        index++
      } else {
        clearInterval(interval)
        setSummaryLoading(false)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [isLoading])

  // Elapsed timer
  useEffect(() => {
    if (isLoading) return
    const interval = setInterval(() => setElapsedTime((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isLoading])

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [transcript])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const fullTranscriptText = transcript.map((t) => `${t.speaker}: ${t.text}`).join("\n")

  return (
    <div className="flex h-screen bg-[#FAF9F7] text-zinc-900 overflow-hidden">

      {/* ── LEFT SIDE — LIVE TRANSCRIPT ── */}
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
              <h1 className="text-sm font-semibold text-zinc-900">Live Transcript</h1>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate max-w-[200px]">
                {meetingId.slice(0, 8)}…
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RecordingIndicator duration={formatTime(elapsedTime)} />
          </div>
        </div>

        {/* Transcript area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 bg-[#F5F4F1]/30">
          {isLoading ? (
            <ProcessingLoader message="Connecting to meeting…" />
          ) : transcript.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500">Waiting for audio…</p>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {transcript.map((entry, i) => (
                <TranscriptChunk
                  key={i}
                  text={entry.text}
                  speaker={entry.speaker}
                  timestamp={entry.timestamp}
                  isNew={i === transcript.length - 1}
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
          <SummaryPanel summary={DEMO_SUMMARY} loading={summaryLoading} />
          <ActionItems items={DEMO_ACTION_ITEMS} loading={summaryLoading} />
        </div>
      </div>
    </div>
  )
}
