interface Props {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-[2.5px]",
}

export default function Spinner({ size = "md", className = "" }: Props) {
  return (
    <div
      className={`
        ${sizeMap[size]}
        border-zinc-600 border-t-zinc-200
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  )
}