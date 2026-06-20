'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { JobStatus, JobSource } from '@/types/database'
import { SOURCE_LABELS, STATUS_LABELS } from '@/lib/constants'
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

export default function NewJobPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchMessage, setFetchMessage] = useState<{ text: string; isError: boolean } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    source: 'other' as JobSource,
    summary: '',
    rate: '',
    tags: [] as string[],
    status: 'not_applied' as JobStatus,
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
      setFetchMessage({
        text: '取得中にエラーが発生しました。手動で入力してください。',
        isError: true,
      })
    } finally {
      setIsFetching(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url || !isValidUrl(url)) return
    setIsSaving(true)
    const { error } = await supabase.from('job_postings').insert({ url, ...form })
    setIsSaving(false)
    if (error) {
      alert('登録に失敗しました: ' + error.message)
      return
    }
    router.push('/')
  }

  const urlValid = isValidUrl(url)
  const busy = isFetching || isSaving

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#0F172A' }}>
        案件を登録
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* URL セクション */}
        <div className="rounded-lg border p-4 flex flex-col gap-3" style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}>
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
              情報を自動取得
            </Button>
          </div>
          {fetchMessage && (
            <p className="text-xs" style={{ color: fetchMessage.isError ? '#DC2626' : '#059669' }}>
              {fetchMessage.text}
            </p>
          )}
        </div>

        {/* 案件情報 */}
        <div className="rounded-lg border p-4 flex flex-col gap-4" style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}>
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
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={!urlValid || busy}
          >
            登録する
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => router.push('/')}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}
