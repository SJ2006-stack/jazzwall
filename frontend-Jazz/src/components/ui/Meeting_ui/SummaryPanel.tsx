import CopyButton from "../General_ui/CopyButton"

interface Props {
  summary: string
  loading?: boolean
}

export default function SummaryPanel({ summary, loading = false }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-sm p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <h2 className="text-sm font-semibold tracking-wide text-zinc-900 uppercase">
            AI Summary
          </h2>
        </div>
        {!loading && <CopyButton text={summary} />}
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-3 w-full rounded-full bg-zinc-100 animate-shimmer bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100" />
          <div className="h-3 w-5/6 rounded-full bg-zinc-100 animate-shimmer bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100" />
          <div className="h-3 w-4/6 rounded-full bg-zinc-100 animate-shimmer bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100" />
        </div>
      ) : (
        <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
          {summary}
        </p>
      )}
    </div>
  )
}