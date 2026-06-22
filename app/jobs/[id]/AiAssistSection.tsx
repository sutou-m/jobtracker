'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type AssistType = 'sales_email' | 'proposal_outline' | 'self_pr'

type JobInfo = {
  title: string | null
  rate: string | null
  tags: string[]
  summary: string | null
  raw_text: string | null
}

type Props = {
  jobInfo: JobInfo
}

const BUTTON_LABELS: Record<AssistType, string> = {
  sales_email: '営業メールを作成',
  proposal_outline: '提案書の構成を作成',
  self_pr: '自己PR文を生成',
}

export function AiAssistSection({ jobInfo }: Props) {
  const [activeType, setActiveType] = useState<AssistType | null>(null)
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate(type: AssistType) {
    setActiveType(type)
    setIsLoading(true)
    setResult('')
    setError('')
    setCopied(false)
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, jobInfo }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.result)
      }
    } catch {
      setError('生成中にエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const assistTypes: AssistType[] = ['sales_email', 'proposal_outline', 'self_pr']

  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-4"
      style={{ borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' }}
    >
      <div>
        <h2 className="text-base font-semibold" style={{ color: '#0F172A' }}>
          AIアシスト
        </h2>
        {!jobInfo.raw_text && !jobInfo.summary && (
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
            概要または貼り付けテキストがあると精度が上がります
          </p>
        )}
      </div>

      {/* 3ボタン */}
      <div className="flex flex-wrap gap-2">
        {assistTypes.map((type) => (
          <Button
            key={type}
            type="button"
            variant="secondary"
            isLoading={isLoading && activeType === type}
            disabled={isLoading}
            onClick={() => handleGenerate(type)}
          >
            {BUTTON_LABELS[type]}
          </Button>
        ))}
      </div>

      {/* 結果表示 */}
      {result && (
        <div className="flex flex-col gap-2">
          {activeType && (
            <p className="text-xs font-medium" style={{ color: '#64748B' }}>
              {BUTTON_LABELS[activeType]}の結果
            </p>
          )}
          <div className="relative">
            <pre
              className="whitespace-pre-wrap text-sm rounded-md border p-3 pr-20"
              style={{ borderColor: '#E2E8F0', color: '#0F172A', backgroundColor: '#F8FAFC', fontFamily: 'inherit' }}
            >
              {result}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 text-xs rounded px-2 py-1 transition-colors"
              style={{
                color: copied ? '#059669' : '#64748B',
                backgroundColor: copied ? '#ECFDF5' : 'transparent',
              }}
            >
              {copied ? '✓ コピー済み' : 'コピー'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs" style={{ color: '#DC2626' }}>
          {error}
        </p>
      )}
    </div>
  )
}
