import { SelectHTMLAttributes } from 'react'

type Option = {
  value: string
  label: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: Option[]
}

export function Select({ label, options, id, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium" style={{ color: '#0F172A' }}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3 py-2 rounded-md border text-sm outline-none transition-colors focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] border-[#E2E8F0] ${className}`}
        style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
