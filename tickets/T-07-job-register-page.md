# T-07: 案件登録画面（/new）

## 前提チケット
T-01（DBスキーマ）、T-03（UIコンポーネント）、T-04（レイアウト）、T-06（URL自動取得API）

## 概要
ユーザーが案件URLを貼り付けてメタ情報を自動取得し、フォームに仮入力した後に確認・編集して登録する画面を実装する。自動取得はあくまで下書き補助であり、登録前にユーザーが必ず内容を確認できる設計にする。

## 実装内容

### 1. `app/new/page.tsx` — Client Component

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { JobStatus, JobSource } from '@/types/database'
// UIコンポーネントをimport

export default function NewJobPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // フォームの状態
  const [form, setForm] = useState({
    title: '',
    source: 'other' as JobSource,
    summary: '',
    rate: '',
    tags: [] as string[],
    status: 'not_applied' as JobStatus,
  })

  // URL自動取得
  async function handleFetch() {
    if (!url) return
    setIsFetching(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/fetch-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) {
        setFetchError('URLが不正です')
        return
      }
      setForm((prev) => ({
        ...prev,
        source: data.source,
        title: data.title ?? '',
        summary: data.summary ?? '',
      }))
      if (!data.title && !data.summary) {
        setFetchError('情報を自動取得できませんでした。手動で入力してください。')
      }
    } catch {
      setFetchError('取得中にエラーが発生しました。手動で入力してください。')
    } finally {
      setIsFetching(false)
    }
  }

  // 登録
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    setIsSaving(true)
    const { error } = await supabase.from('job_postings').insert({
      url,
      ...form,
    })
    setIsSaving(false)
    if (error) {
      alert('登録に失敗しました: ' + error.message)
      return
    }
    router.push('/')
  }
  // ... フォームUI
}
```

### 2. フォームUI構成
1. URLセクション:
   - URL入力フィールド（必須）
   - 「情報を自動取得」ボタン
   - 取得中スピナー
   - 取得結果のフィードバックメッセージ（成功/失敗）

2. 案件情報セクション（フォーム）:
   - 案件タイトル（Input）
   - サイト種別（Select: indeed/ランサーズ/Findy/Wantedly/その他）
   - 概要・詳細メモ（Textarea）
   - 想定単価・報酬（Input）
   - スキル・タグ（TagInput）
   - ステータス（Select: デフォルト「未応募」）

3. ボタン:
   - 「登録する」（primary）
   - 「キャンセル」→ `/` へ戻る（ghost）

### 3. バリデーション
- URL は必須（空の場合「自動取得」ボタン・「登録する」ボタンを無効化）
- URLの形式チェック（`URL` コンストラクタで検証）

### 対象ファイル
- `app/new/page.tsx`

## 完了条件
- [ ] URLを入力して「情報を自動取得」を押すと、T-06のAPIを呼び出してフォームに仮入力される
- [ ] 取得失敗時はエラーメッセージが表示され、空フォームで手入力できる
- [ ] 全項目を入力して「登録する」を押すと `job_postings` テーブルに保存される
- [ ] 登録後に `/`（一覧画面）へリダイレクトされる
- [ ] URLが空のとき「登録する」ボタンがdisabledになる
- [ ] ステータスのデフォルトが「未応募」になっている
- [ ] `isSaving` 中は「登録する」ボタンがローディング表示になる

## 注意事項
- 自動取得が成功しても**必ずフォームを表示してユーザーに確認させる**。サーバー側で取得→自動保存するワンショット設計にしない
- `isFetching` と `isSaving` の両方でボタンのdisabledを管理する（二重送信防止）
- `supabase.from('job_postings').insert()` はサービスキーではなく anonキーで行う（RLSポリシーが anon を許可しているため）
- タグ（`text[]`）の保存：PostgreSQL の配列型として渡す（`["React", "TypeScript"]` の形）
