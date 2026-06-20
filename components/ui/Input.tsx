import { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  required?: boolean
}

export function Input({ label, error, required, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: '#0F172A' }}>
          {label}
          {required && <span className="ml-1" style={{ color: '#DC2626' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] ${error ? 'border-[#EF4444]' : 'border-[#E2E8F0]'} ${className}`}
        style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: '#DC2626' }}>{error}</span>
      )}
    </div>
  )
}
