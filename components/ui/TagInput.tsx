'use client'

import { KeyboardEvent, useState } from 'react'

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
  label?: string
  placeholder?: string
}

export function TagInput({ tags, onChange, label, placeholder = 'タグを入力してEnter' }: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag(value: string) {
    const trimmed = value.trim().replace(/,$/, '')
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium" style={{ color: '#0F172A' }}>{label}</span>
      )}
      <div
        className="flex flex-wrap gap-1.5 px-3 py-2 rounded-md border border-[#E2E8F0] focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-[#2563EB]"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
            style={{ color: '#2563EB', backgroundColor: '#EFF6FF' }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:opacity-70 leading-none"
              aria-label={`${tag}を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-24 text-sm outline-none bg-transparent"
          style={{ color: '#0F172A' }}
        />
      </div>
    </div>
  )
}
