'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { JobStatus } from '@/types/database'
import { StatusBadge } from '@/components/ui/StatusBadge'

const statuses: JobStatus[] = ['not_applied', 'applied', 'interview', 'won', 'declined']

type Props = {
  jobId: string
  currentStatus: JobStatus
}

export function StatusDropdown({ jobId, currentStatus }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  async function handleSelect(status: JobStatus) {
    if (status === optimisticStatus) {
      setIsOpen(false)
      return
    }
    setIsOpen(false)
    setIsUpdating(true)
    setOptimisticStatus(status)
    await supabase.from('job_postings').update({ status }).eq('id', jobId)
    setIsUpdating(false)
    router.refresh()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen((o) => !o) }}
        className="flex items-center gap-1 rounded focus:outline-none"
        aria-label="ステータスを変更"
      >
        <StatusBadge status={optimisticStatus} />
        {isUpdating && (
          <span
            className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
            style={{ color: '#94A3B8' }}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-20 rounded-md shadow-lg border py-1 min-w-[8rem]"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}
        >
          {statuses.map((s) => (
            <button
              key={s}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(s) }}
              className="flex items-center w-full px-3 py-2 text-sm hover:bg-[#F1F5F9] transition-colors"
            >
              <StatusBadge status={s} />
              {s === optimisticStatus && (
                <span className="ml-auto text-xs" style={{ color: '#94A3B8' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
