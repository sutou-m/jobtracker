import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `あなたは求人・案件情報を構造化するアシスタントです。
ユーザーから案件の本文テキストが与えられるので、以下のJSONを必ず返してください。
推測できない項目はnullまたは空配列にしてください。説明文やコードブロックは不要です。JSONのみ返してください。

{
  "title": "案件タイトル（string | null）",
  "rate": "単価・報酬の文字列（例: '月60万円'）（string | null）",
  "tags": ["スキル名", ...],
  "source": "indeed | lancers | findy | wantedly | other"
}

sourceの判定基準:
- テキスト中に「Indeed」が含まれる → "indeed"
- 「ランサーズ」「Lancers」が含まれる → "lancers"
- 「Findy」「ファインディ」が含まれる → "findy"
- 「Wantedly」「ウォンテッドリー」が含まれる → "wantedly"
- 判断できない → "other"`

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'テキストが空です' }, { status: 400 })
  }

  const trimmed = text.trim().slice(0, 3000)

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: trimmed },
        ],
      },
      { signal: AbortSignal.timeout(15000) }
    )

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)

    return NextResponse.json({
      title: typeof parsed.title === 'string' ? parsed.title : null,
      rate: typeof parsed.rate === 'string' ? parsed.rate : null,
      tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t: unknown) => typeof t === 'string') : [],
      source: ['indeed', 'lancers', 'findy', 'wantedly', 'other'].includes(parsed.source)
        ? parsed.source
        : 'other',
    })
  } catch {
    return NextResponse.json({ error: '抽出中にエラーが発生しました' }, { status: 500 })
  }
}
