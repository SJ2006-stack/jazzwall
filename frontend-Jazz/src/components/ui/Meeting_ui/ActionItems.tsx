"use client"

import { useState } from "react"

interface Props {
  items: string[]
  loading?: boolean
}

export default function ActionItems({ items, loading = false }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  return (
    <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-sm p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        <h2 className="text-sm font-semibold tracking-wide text-zinc-900 uppercase">
          Action Items
        </h2>
        {!loading && items.length > 0 && (
          <span className="ml-auto text-[10px] tabular-nums font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-zinc-100 animate-shimmer bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100" />
              <div className="h-3 flex-1 rounded-full bg-zinc-100 animate-shimmer bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2 stagger-children">
          {items.map((item, i) => (
            <li
              key={i}
              onClick={() => toggleItem(i)}
              className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-50 transition-colors duration-150 cursor-pointer"
            >
              {/* Checkbox */}
              <div
                className={`
                  mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center
                  transition-all duration-150
                  ${checked.has(i)
                    ? "bg-emerald-50 border-emerald-400"
                    : "border-zinc-300 group-hover:border-zinc-400"
                  }
                `}
              >
                {checked.has(i) && (
                  <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>

              <span
                className={`
                  text-sm leading-relaxed transition-all duration-150
                  ${checked.has(i) ? "text-zinc-400 line-through" : "text-zinc-700"}
                `}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}