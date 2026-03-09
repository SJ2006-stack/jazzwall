"use client"

import { useState } from "react"

interface Props {
  text: string
  label?: string
}

export default function CopyButton({ text, label }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="
        group inline-flex items-center gap-1.5
        text-xs px-3 py-1.5 rounded-lg
        bg-zinc-100 border border-zinc-200
        text-zinc-500 hover:text-zinc-800
        hover:bg-zinc-200 hover:border-zinc-300
        transition-all duration-150 ease-out
        cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50
      "
    >
      {/* icon */}
      <svg
        className="w-3.5 h-3.5 transition-transform duration-150 group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
          />
        )}
      </svg>

      <span className="transition-all duration-150">
        {copied ? "Copied!" : label || "Copy"}
      </span>
    </button>
  )
}