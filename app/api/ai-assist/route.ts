import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type AssistType = 'sales_email' | 'proposal_outline' | 'self_pr'

type JobInfo = {
  title: string | null
  rate: string | null
  tags: string[]
  summary: string | null
  raw_text: string | null
  source?: string | null
  url?: string | null
}

function isLancersJob(jobInfo: JobInfo): boolean {
  if (jobInfo.source === 'lancers') return true
  if (jobInfo.url && jobInfo.url.includes('lancers.jp')) return true
  return false
}

function getLancersProposalPrompt(): string {
  const profile = fs.readFileSync(path.join(process.cwd(), 'LANCERS_PROFILE.md'), 'utf-8')

  return `あなたはランサーズ向け提案文の作成を支援するアシスタントです。
LANCERS_PROFILE.mdのプロフィール情報を使って、以下のフォーマットで提案文を生成してください。
実績は案件内容に関連するものだけを2〜3件選んで記載し、実在しない実績は絶対に書かないこと。
技術構成は案件の要件に合わせて具体的に提案すること。
クライアント名が案件情報から分からない場合は「ご担当者様」としてください。

【プロフィール情報】
${profile}

---フォーマット---
{クライアント名}様

はじめまして。FujiLABO（フジラボ）の須藤と申します。
ご依頼内容を拝見し、ぜひお力になりたいと思いご連絡させていただきました。

▲ 自己PR
[プロフィールの自己PRをベースに、案件に関連する強みを1〜2文追加]

▲ 過去の実績
私のこれまでの実績についてご紹介いたします。

【主な実績】
[案件内容に関連する実績を2〜3件、プロフィールから選んで記載]

【対応可能な業務範囲】
[案件の要件に合わせた対応範囲を3〜5項目]

【想定する技術構成】（案件内容に合わせて）
[案件に適した技術スタックを提案]

▲ 事前にご案内したいこと
ご契約前にいくつかご確認いただきたい点がございます。

【稼働時間】
平日: 10時〜18時（応相談）
土日: 応相談

【納期目安】
[案件の希望納期を踏まえた現実的な納期感]

【修正対応】
軽微な修正は2回まで無料で対応いたします

ご期待に添えるよう全力で取り組みます。
どうぞよろしくお願いします。
---フォーマット終わり---`
}

const SYSTEM_PROMPTS: Record<AssistType, string> = {
  sales_email: `あなたはフリーランスエンジニアの営業メール作成を支援するアシスタントです。
以下の案件情報をもとに、案件への応募・問い合わせメールのドラフトを日本語で作成してください。
件名と本文を含めてください。自然でビジネス丁寧語の文体にしてください。`,

  proposal_outline: `あなたはフリーランスエンジニアの提案書作成を支援するアシスタントです。
以下の案件情報をもとに、Manusなどのスライド生成AIに渡す提案書の指示文を日本語で作成してください。

【出力形式】
スライド構成の指示文として、以下の要素を含めてください：

デザイン指定：
- カラー：ネイビー（#0D1B3E）×ゴールド（#C9A84C）×ホワイト
- フォント：Calibri（タイトル）、Arial（本文）
- シンプル・プロフェッショナルな印象

スライド構成（案件内容に合わせて調整）：
1. 表紙（タイトル＋「FujiLABO 須藤 真理」）
2. 現状課題の整理
3. 提案内容・システム概要
4. 使用技術（Next.js / TypeScript / Supabase / Vercel を基本とし、案件に応じて調整）
5. 進め方・スケジュール
6. コミュニケーション（ZOOM・電話対応可、即日返信）
7. 料金・支払い条件
8. 実績・専門性（業務システム開発25年、ServiceHub・Kakeru・Vettly等）
9. まとめ・サポート体制`,

  self_pr: `あなたはフリーランスエンジニアの自己PR文作成を支援するアシスタントです。
以下の案件情報をもとに、この案件に応募する際の自己PR文のドラフトを日本語で作成してください。
200〜400字程度でまとめてください。`,
}

function formatJobInfo(jobInfo: JobInfo): string {
  const lines: string[] = []
  if (jobInfo.title) lines.push(`案件タイトル: ${jobInfo.title}`)
  if (jobInfo.rate) lines.push(`想定単価: ${jobInfo.rate}`)
  if (jobInfo.tags.length > 0) lines.push(`スキル・タグ: ${jobInfo.tags.join(', ')}`)

  // raw_text がある場合は最大3000文字を使用、なければ summary で代替
  const bodyText = jobInfo.raw_text
    ? jobInfo.raw_text.trim().slice(0, 3000)
    : jobInfo.summary

  if (bodyText) lines.push(`\n案件内容:\n${bodyText}`)

  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  const { type, jobInfo } = await req.json() as { type: AssistType; jobInfo: JobInfo }

  if (!type || !SYSTEM_PROMPTS[type]) {
    return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  const formattedJobInfo = formatJobInfo(jobInfo)
  if (!formattedJobInfo.trim()) {
    return NextResponse.json({ error: '案件情報が不足しています' }, { status: 400 })
  }

  const systemPrompt =
    type === 'proposal_outline' && isLancersJob(jobInfo)
      ? getLancersProposalPrompt()
      : SYSTEM_PROMPTS[type]

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `案件情報:\n${formattedJobInfo}` },
        ],
      },
      { signal: AbortSignal.timeout(20000) }
    )

    const result = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ result })
  } catch {
    return NextResponse.json({ error: '生成中にエラーが発生しました' }, { status: 500 })
  }
}
