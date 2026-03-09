"use client"

import { motion } from "framer-motion"
import { Reveal } from "./SectionPrimitives"
import { PREVIEW_MESSAGES } from "@/lib/landing-data"

const AI_INSIGHTS = [
  { label: "Action Item", color: "text-amber-600", text: "Priya to ship feature by Tuesday" },
  { label: "Decision", color: "text-orange-600", text: "API docs must be updated before launch" },
  { label: "Follow-up", color: "text-rose-600", text: "Arjun syncing with design team" },
]

export default function ProductPreview() {
  return (
    <section className="relative flex flex-col items-center -mt-16 sm:-mt-24 pb-24 sm:pb-32 px-6 sm:px-8 lg:px-12">
      <Reveal>
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 shadow-2xl shadow-zinc-900/[0.06] bg-white">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/80">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-sm mx-auto h-6 rounded-md bg-zinc-100 border border-zinc-200/60 flex items-center px-3">
                  <span className="text-[11px] text-zinc-400">app.jazzwall.ai/meeting/live</span>
                </div>
              </div>
            </div>
            {/* Mock meeting UI */}
            <div className="grid grid-cols-1 sm:grid-cols-5 min-h-[280px] sm:min-h-[340px]">
              {/* Transcript side */}
              <div className="sm:col-span-3 p-5 sm:p-7 space-y-4 border-r border-zinc-100">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-amber-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Live Transcript</span>
                </div>
                {PREVIEW_MESSAGES.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.4, ease: "easeOut" }}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${msg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className="text-[10px] font-bold text-white">{msg.speaker[0]}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-800">{msg.speaker}</span>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {msg.text}
                        {/* Blinking cursor on the last message */}
                        {i === PREVIEW_MESSAGES.length - 1 && (
                          <motion.span
                            className="inline-block w-[2px] h-[14px] bg-amber-500 ml-0.5 align-middle rounded-full"
                            animate={{ opacity: [1, 1, 0, 0] }}
                            transition={{ duration: 1, repeat: Infinity, times: [0, 0.45, 0.55, 1] }}
                          />
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* AI panel */}
              <div className="sm:col-span-2 p-5 sm:p-7 bg-zinc-50/50">
                <div className="flex items-center gap-2 mb-5">
                  <motion.div
                    className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  </motion.div>
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">AI Insights</span>
                </div>
                <div className="space-y-3">
                  {AI_INSIGHTS.map((insight, i) => (
                    <motion.div
                      key={i}
                      className="p-3 rounded-xl bg-white border border-zinc-200/60 hover:border-amber-200/60 hover:shadow-md transition-[border-color,box-shadow] duration-200"
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ duration: 0.4, delay: 0.8 + i * 0.25, ease: "easeOut" }}
                    >
                      <p className={`text-xs font-semibold ${insight.color} mb-1`}>{insight.label}</p>
                      <p className="text-xs text-zinc-600">{insight.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
