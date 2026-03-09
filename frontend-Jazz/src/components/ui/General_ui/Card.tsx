interface Props {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export default function Card({ children, className = "", glow = false }: Props) {
  return (
    <div
      className={`
        relative rounded-2xl
        bg-white backdrop-blur-md
        border border-zinc-200/80
        transition-all duration-200
        ${glow ? "hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}