type BadgeProps = {
  label: string
  textColor: string
  bgColor: string
}

export function Badge({ label, textColor, bgColor }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: textColor, backgroundColor: bgColor }}
    >
      {label}
    </span>
  )
}
