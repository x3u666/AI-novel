import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const TIMEOUT_MS   = 30_000;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not set' }, { status: 500 });
    }

    let body: { systemPrompt: string; messages: { role: string; content: string }[] };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { systemPrompt, messages } = body;
    if (!systemPrompt || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing required fields: systemPrompt, messages' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 1400,
          temperature: 0.85,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json({ error: `Timed out after ${TIMEOUT_MS / 1000}s` }, { status: 504 });
      }
      return NextResponse.json({ error: `Network error: ${String(err)}` }, { status: 502 });
    }

    clearTimeout(timer);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[Groq] API error:', response.status, text);
      return NextResponse.json(
        { error: `${response.status}: ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';

    if (!content) {
      console.error('[Groq] Empty content in response');
      return NextResponse.json({ error: 'Empty content in response' }, { status: 503 });
    }

    return NextResponse.json({ content });

  } catch (err) {
    console.error('[narrative/route] Unhandled error:', err);
    return NextResponse.json(
      { error: `Internal server error: ${String(err)}` },
      { status: 500 }
    );
  }
}
