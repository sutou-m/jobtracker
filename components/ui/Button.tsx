import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantStyles: Record<Variant, string> = {
  primary:   'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
  secondary: 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A]',
  danger:    'bg-[#EF4444] hover:bg-[#DC2626] text-white',
  ghost:     'bg-transparent hover:bg-[#F1F5F9] text-[#0F172A]',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
