'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { JobPosting, JobStatus, JobSource } from '@/types/database'
import { SOURCE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { TagInput } from '@/components/ui/TagInput'
import { Button } from '@/components/ui/Button'

const sourceOptions = (Object.entries(SOURCE_LABELS) as [JobSource, string][]).map(
  ([value, label]) => ({ value, label })
)

const statusOptions = (Object.entries(STATUS_LABELS) as [JobStatus, string][]).map(
  ([value, label]) => ({ value, label })
)

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

type Props = {
  job: JobPosting
}

export function JobEditForm({ job }: Props) {
  const router = useRouter()
  const [url, setUrl] = useState(job.url)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchMessage, setFetchMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [form, setForm] = useState({
    title: job.title ?? '',
    source: job.source,
    summary: job.summary ?? '',
    rate: job.rate ?? '',
    tags: job.tags,
    status: job.status,
  })

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleFetch() {
    if (!url || !isValidUrl(url)) return
    setIsFetching(true)
    setFetchMessage(null)
    try {
      const res = await fetch('/api/fetch-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) {
        setFetchMessage({ text: 'URLが不正です', isError: true })
        return
      }
      setForm((prev) => ({
        ...prev,
        source: data.source,
        title: data.title ?? prev.title,
        summary: data.summary ?? prev.summary,
      }))
      if (!data.title && !data.summary) {
        setFetchMessage({
          text: '情報を自動取得できませんでした。手動で入力してください。',
          isError: true,
        })
      } else {
        setFetchMessage({ text: 'タイトルと概要を自動入力しました。内容を確認してください。', isError: false })
      }
    } catch {
      setFetchMessage({ text: '取得中にエラーが発生しました。手動で入力してください。', isError: true })
    } finally {
      setIsFetching(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!url || !isValidUrl(url)) return
    setIsSaving(true)
    const { error } = await supabase
      .from('job_postings')
      .update({ url, ...form })
      .eq('id', job.id)
    setIsSaving(false)
    if (error) {
      alert('更新に失敗しました: ' + error.message)
      return
    }
    router.push('/')
  }

  async function handleDelete() {
    const confirmed = window.confirm('この案件を削除しますか？この操作は元に戻せません。')
    if (!confirmed) return
    setIsDeleting(true)
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', job.id)
    setIsDeleting(false)
    if (error) {
      alert('削除に失敗しました: ' + error.message)
      return
    }
    router.push('/')
  }

  const urlValid = isValidUrl(url)
  const busy = isFetching || isSaving || isDeleting
  const { text: statusTextColor, bg: statusBg } = STATUS_COLORS[form.status]

  return (
    <div className="max-w-2xl">
      {/* ナビゲーション */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm mb-4"
        style={{ color: '#64748B' }}
      >
        ← 一覧へ戻る
      </Link>

      {/* ページ上部の情報 */}
      <div
        className="rounded-lg border p-4 mb-6 flex flex-col gap-2"
        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium truncate max-w-xs"
            style={{ color: '#2563EB' }}
          >
            {job.url}
          </a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ color: statusTextColor, backgroundColor: statusBg }}
          >
            {STATUS_LABELS[form.status]}
          </span>
          <span className="text-xs" style={{ color: '#94A3B8' }}>
            登録日: {formatDate(job.created_at)}
          </span>
          <span className="text-xs" style={{ color: '#94A3B8' }}>
            更新日: {formatDate(job.updated_at)}
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6" style={{ color: '#0F172A' }}>
        案件を編集
      </h1>

      <form onSubmit={handleUpdate} className="flex flex-col gap-5">
        {/* URL セクション */}
        <div
          className="rounded-lg border p-4 flex flex-col gap-3"
          style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
        >
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                id="url"
                label="案件URL"
                required
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => { setUrl(e.target.value); setFetchMessage(null) }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              isLoading={isFetching}
              disabled={!urlValid || busy}
              onClick={handleFetch}
              className="shrink-0"
            >
              再取得
            </Button>
          </div>
          {fetchMessage && (
            <p className="text-xs" style={{ color: fetchMessage.isError ? '#DC2626' : '#059669' }}>
              {fetchMessage.text}
            </p>
          )}
        </div>

        {/* 案件情報 */}
        <div
          className="rounded-lg border p-4 flex flex-col gap-4"
          style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
        >
          <Input
            id="title"
            label="案件タイトル"
            placeholder="タイトルを入力"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
          />

          <Select
            id="source"
            label="サイト種別"
            options={sourceOptions}
            value={form.source}
            onChange={(e) => setField('source', e.target.value as JobSource)}
          />

          <Textarea
            id="summary"
            label="概要・詳細メモ"
            rows={4}
            placeholder="案件の概要や備考を入力"
            value={form.summary}
            onChange={(e) => setField('summary', e.target.value)}
          />

          <Input
            id="rate"
            label="想定単価・報酬"
            placeholder="例: 月60万円、時給3,000円"
            value={form.rate}
            onChange={(e) => setField('rate', e.target.value)}
          />

          <TagInput
            label="スキル・タグ"
            tags={form.tags}
            onChange={(tags) => setField('tags', tags)}
            placeholder="React, TypeScript など入力してEnter"
          />

          <Select
            id="status"
            label="ステータス"
            options={statusOptions}
            value={form.status}
            onChange={(e) => setField('status', e.target.value as JobStatus)}
          />
        </div>

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!urlValid || busy}
            className="w-full sm:w-auto"
          >
            更新する
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            キャンセル
          </Button>
        </div>

        {/* 削除 */}
        <div className="border-t pt-4" style={{ borderColor: '#E2E8F0' }}>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            disabled={busy}
            onClick={handleDelete}
          >
            この案件を削除
          </Button>
        </div>
      </form>
    </div>
  )
}
