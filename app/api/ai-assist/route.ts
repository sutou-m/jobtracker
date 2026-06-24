import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type AssistType = 'sales_email' | 'proposal_outline' | 'self_pr'

type JobInfo = {
  title: string | null
  rate: string | null
  tags: string[]
  summary: string | null
  raw_text: string | null
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

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[type] },
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
