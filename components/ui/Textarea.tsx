import { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  rows?: number
}

export function Textarea({ label, rows = 4, id, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: '#0F172A' }}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] border-[#E2E8F0] resize-y ${className}`}
        style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
        {...props}
      />
    </div>
  )
}
