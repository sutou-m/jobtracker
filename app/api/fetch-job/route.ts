import { NextRequest, NextResponse } from 'next/server'
import { JobSource } from '@/types/database'

function detectSource(url: string): JobSource {
  if (url.includes('indeed.com')) return 'indeed'
  if (url.includes('lancers.jp')) return 'lancers'
  if (url.includes('findy.io') || url.includes('findy-code.io')) return 'findy'
  if (url.includes('wantedly.com')) return 'wantedly'
  return 'other'
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URLが不正です' }, { status: 400 })
  }

  const source = detectSource(url)

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ja,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ source, title: null, summary: null })
    }

    const html = await res.text()

    const title =
      html.match(/<meta property="og:title" content="([^"]*)"/)?.[ 1] ||
      html.match(/<title>([^<]*)<\/title>/)?.[ 1] ||
      null

    const summary =
      html.match(/<meta property="og:description" content="([^"]*)"/)?.[ 1] ||
      html.match(/<meta name="description" content="([^"]*)"/)?.[ 1] ||
      null

    return NextResponse.json({
      source,
      title: title?.trim() ?? null,
      summary: summary?.trim() ?? null,
    })
  } catch {
    return NextResponse.json({ source, title: null, summary: null })
  }
}
