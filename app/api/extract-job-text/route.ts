import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const VALID_SOURCES = ['indeed', 'lancers', 'findy', 'wantedly', 'other'] as const

function buildSourceHint(url: string | undefined): string {
  if (!url) return ''
  if (url.includes('indeed.com')) return 'URLのドメインが indeed.com のため、source は "indeed" を優先してください。'
  if (url.includes('lancers.jp')) return 'URLのドメインが lancers.jp のため、source は "lancers" を優先してください。'
  if (url.includes('findy')) return 'URLのドメインが findy のため、source は "findy" を優先してください。'
  if (url.includes('wantedly.com')) return 'URLのドメインが wantedly.com のため、source は "wantedly" を優先してください。'
  return ''
}

function buildSystemPrompt(urlHint: string): string {
  return `あなたは求人・案件情報を構造化するアシスタントです。
以下のJSONのみを返してください。説明文・コードブロック不要。

{
  "title": "案件タイトル（string | null）",
  "rate": "単価・報酬の文字列（例: '月60万円'）（string | null）",
  "tags": ["スキル名", ...],
  "source": "indeed | lancers | findy | wantedly | other",
  "summary": "業務内容・必須要件を2〜3文で要約した日本語テキスト（string | null）"
}

【tagsの抽出ルール】
含めるもの（以下カテゴリに明確に属するもののみ）:
- プログラミング言語: Python, TypeScript, JavaScript, Go, Rust, Ruby, PHP, Swift, Kotlin, Java, C# など
- フレームワーク・ライブラリ: React, Next.js, Vue, Nuxt, Angular, Svelte, FastAPI, Django, Rails, Laravel, NestJS, Express など
- クラウド・インフラ: AWS, Azure, GCP, Docker, Kubernetes, Terraform など
- データベース: PostgreSQL, MySQL, MongoDB, Redis, Supabase, Firebase など

除外するもの（絶対に含めない）:
- コミュニケーション・プロジェクト管理ツール: Slack, Notion, Wrike, Jira, Confluence, Teams, Backlog など
- AIコーディング支援・生成AIツール: ChatGPT, Claude, Claude Code, GitHub Copilot, Devin, Kiro, Codex, Cursor など
- 「開発環境」「使用ツール一覧」「生成AIについて」のような環境説明セクションに列挙されている項目
「求める言語・スキル」「必須スキル」「技術スタック」のような明示的なスキル見出しの直下の項目を優先すること。

【sourceの判定ルール】
${urlHint ? urlHint + '\n' : ''}テキスト中に「Indeed」があれば "indeed"、「ランサーズ」「Lancers」があれば "lancers"、「Findy」「ファインディ」があれば "findy"、「Wantedly」「ウォンテッドリー」があれば "wantedly"、判断できなければ "other"。

【summaryの生成ルール】
業務内容・必須要件のセクションから、要点を2〜3文の日本語で要約すること。原文の単純な抜粋ではなく、読み手が案件を素早く把握できる要約にすること。該当セクションがなければ null。`
}

export async function POST(req: NextRequest) {
  const { text, url } = await req.json()

  if (!text || typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'テキストが空です' }, { status: 400 })
  }

  const trimmed = text.trim().slice(0, 3000)
  const urlHint = buildSourceHint(typeof url === 'string' ? url : undefined)

  try {
    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(urlHint) },
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
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((t: unknown) => typeof t === 'string')
        : [],
      source: VALID_SOURCES.includes(parsed.source) ? parsed.source : 'other',
      summary: typeof parsed.summary === 'string' ? parsed.summary : null,
    })
  } catch {
    return NextResponse.json({ error: '抽出中にエラーが発生しました' }, { status: 500 })
  }
}
