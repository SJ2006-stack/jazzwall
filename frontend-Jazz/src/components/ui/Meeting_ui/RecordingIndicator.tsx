interface Props {
  duration?: string
}

export default function RecordingIndicator({ duration }: Props) {
  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
      {/* Pulsing dot with glow */}
      <span className="relative flex items-center justify-center w-2.5 h-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
      </span>

      <span className="text-xs font-medium text-red-600 tracking-wide">
        Recording
      </span>

      {duration && (
        <span className="text-[10px] tabular-nums text-red-500/60 font-mono">
          {duration}
        </span>
      )}
    </div>
  )
}