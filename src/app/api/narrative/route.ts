import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const TIMEOUT_MS   = 30_000;

type CallResult = { content: string } | { error: string; status: number };

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
  stream: boolean,
): Promise<Response | CallResult> {
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
        max_tokens: 1200,
        temperature: 0.85,
        stream,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      return { error: `Timed out after ${TIMEOUT_MS / 1000}s`, status: 504 };
    }
    return { error: `Network error: ${String(err)}`, status: 502 };
  }

  clearTimeout(timer);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    return { error: `${response.status}: ${text}`, status: response.status };
  }

  if (stream) return response;

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content) return { error: 'Empty content in response', status: 503 };
  return { content };
}

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
      return NextResponse.json({ error: 'Missing required fields: systemPrompt, messages' }, { status: 400 });
    }

    const result = await callGroq(apiKey, systemPrompt, messages, true);

    // Streaming response — pipe through
    if (result instanceof Response) {
      return new Response(result.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    console.error('[Groq] Failed:', result.error);
    return NextResponse.json({ error: result.error }, { status: result.status });

  } catch (err) {
    console.error('[narrative/route] Unhandled error:', err);
    return NextResponse.json({ error: `Internal server error: ${String(err)}` }, { status: 500 });
  }
}
