'use client'

import { useRef, useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { STATUS_LABELS, SOURCE_LABELS } from '@/lib/constants'
import type { JobStatus, JobSource } from '@/types/database'

const statusOptions = Object.entries(STATUS_LABELS) as [JobStatus, string][]
const sourceOptions = Object.entries(SOURCE_LABELS) as [JobSource, string][]

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const isMounted = useRef(false)
  const searchParamsRef = useRef(searchParams)

  useEffect(() => {
    searchParamsRef.current = searchParams
  })

  // debounce: q が変化してから 300ms 後に URL を更新
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      if (q) {
        params.set('q', q)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.push(`/?${params.toString()}`)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`/?${params.toString()}`)
    })
  }

  function resetFilters() {
    setQ('')
    setIsFiltersOpen(false)
    startTransition(() => {
      router.push('/')
    })
  }

  const activeStatus = searchParams.get('status') ?? ''
  const activeSource = searchParams.get('source') ?? ''
  const activeSort = searchParams.get('sort') ?? ''
  const activeCount = [activeStatus, activeSource, q, activeSort].filter(Boolean).length
  const hasActiveFilters = activeCount > 0

  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* キーワード検索 + ソート */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="キーワード検索..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 rounded-md border px-3 py-1.5 text-sm outline-none"
          style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A' }}
        />
        <div className="flex rounded-md border overflow-hidden shrink-0" style={{ borderColor: '#E2E8F0' }}>
          <button
            onClick={() => updateFilter('sort', '')}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={!activeSort
              ? { backgroundColor: '#2563EB', color: '#FFFFFF' }
              : { backgroundColor: '#FFFFFF', color: '#64748B' }}
          >
            新着順
          </button>
          <button
            onClick={() => updateFilter('sort', 'updated_at')}
            className="px-3 py-1.5 text-xs font-medium transition-colors border-l"
            style={activeSort === 'updated_at'
              ? { backgroundColor: '#2563EB', color: '#FFFFFF' }
              : { backgroundColor: '#FFFFFF', color: '#64748B' }}
          >
            更新順
          </button>
        </div>
      </div>

      {/* モバイル用フィルタトグルボタン */}
      <button
        className="sm:hidden flex items-center justify-between w-full text-xs font-medium rounded-md border px-3 py-2 transition-colors"
        style={{
          borderColor: '#E2E8F0',
          backgroundColor: hasActiveFilters ? '#EFF6FF' : '#F8FAFC',
          color: hasActiveFilters ? '#2563EB' : '#64748B',
        }}
        onClick={() => setIsFiltersOpen((o) => !o)}
      >
        <span>
          絞り込み
          {hasActiveFilters && (
            <span
              className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px]"
              style={{ backgroundColor: '#2563EB' }}
            >
              {activeCount}
            </span>
          )}
        </span>
        <span>{isFiltersOpen ? '▲' : '▼'}</span>
      </button>

      {/* フィルタチップ: モバイルでは折りたたみ、デスクトップでは常時表示 */}
      <div className={`flex-col gap-3 ${isFiltersOpen ? 'flex' : 'hidden'} sm:flex`}>
        {/* ステータスフィルタ */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="すべて" active={!activeStatus} onClick={() => updateFilter('status', '')} />
          {statusOptions.map(([value, label]) => (
            <FilterChip
              key={value}
              label={label}
              active={activeStatus === value}
              onClick={() => updateFilter('status', activeStatus === value ? '' : value)}
            />
          ))}
        </div>

        {/* サイト種別フィルタ */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="すべて" active={!activeSource} onClick={() => updateFilter('source', '')} />
          {sourceOptions.map(([value, label]) => (
            <FilterChip
              key={value}
              label={label}
              active={activeSource === value}
              onClick={() => updateFilter('source', activeSource === value ? '' : value)}
            />
          ))}
        </div>
      </div>

      {/* アクティブフィルタバッジ + リセット */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeStatus && (
            <ActiveBadge
              label={STATUS_LABELS[activeStatus as JobStatus]}
              onRemove={() => updateFilter('status', '')}
            />
          )}
          {activeSource && (
            <ActiveBadge
              label={SOURCE_LABELS[activeSource as JobSource]}
              onRemove={() => updateFilter('source', '')}
            />
          )}
          {q && (
            <ActiveBadge label={`「${q}」`} onRemove={() => setQ('')} />
          )}
          {activeSort && (
            <ActiveBadge label="更新順" onRemove={() => updateFilter('sort', '')} />
          )}
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium rounded-md border px-3 py-1 transition-colors hover:bg-[#F1F5F9]"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}
          >
            ✕ リセット
          </button>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
      style={active
        ? { backgroundColor: '#2563EB', color: '#FFFFFF' }
        : { backgroundColor: '#F1F5F9', color: '#64748B' }}
    >
      {label}
    </button>
  )
}

function ActiveBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity leading-none"
        aria-label="フィルタを解除"
      >
        ×
      </button>
    </span>
  )
}
