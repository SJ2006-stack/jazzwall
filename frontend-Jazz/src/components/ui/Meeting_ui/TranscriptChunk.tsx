interface Props {
  text: string
  speaker?: string
  timestamp?: string
  isNew?: boolean
}

export default function TranscriptChunk({
  text,
  speaker = "Speaker",
  timestamp,
  isNew = false,
}: Props) {
  return (
    <div
      className={`
        group relative
        rounded-xl p-4
        bg-white border border-zinc-200/60
        hover:border-zinc-300 hover:shadow-sm
        transition-all duration-200
        ${isNew ? "animate-slide-in-right" : "animate-fade-in"}
      `}
    >
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-1.5">
        {/* Avatar dot */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <span className="text-[9px] font-bold text-white leading-none">
            {speaker.charAt(0).toUpperCase()}
          </span>
        </div>

        <span className="text-xs font-medium text-zinc-800">
          {speaker}
        </span>

        {timestamp && (
          <span className="text-[10px] tabular-nums text-zinc-600 ml-auto">
            {timestamp}
          </span>
        )}
      </div>

      {/* Transcript text */}
      <p className="text-sm leading-relaxed text-zinc-600 pl-7">
        {text}
      </p>
    </div>
  )
}