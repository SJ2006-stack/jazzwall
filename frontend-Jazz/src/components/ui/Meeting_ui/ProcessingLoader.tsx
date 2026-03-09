interface Props {
  message?: string
}

export default function ProcessingLoader({ message = "Processing audio…" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12 animate-fade-in">
      {/* Animated bars */}
      <div className="flex items-end gap-1 h-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-amber-500/80"
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
              height: `${12 + Math.random() * 20}px`,
            }}
          />
        ))}
      </div>

      <p className="text-sm text-zinc-500 font-medium">{message}</p>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}