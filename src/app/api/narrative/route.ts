import { NextRequest, NextResponse } from 'next/server';

// Gemini OpenAI-compatible endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const TIMEOUT_MS     = 30_000;

/**
 * Free Gemini models (March 2026), ordered by capability:
 *
 * 1. gemini-2.5-flash      — основная: 10 RPM, 250 RPD, лучшее качество
 * 2. gemini-2.5-flash-lite — фолбэк:   15 RPM, 1000 RPD, быстрее и больше лимит
 *
 * Оба используют OpenAI-compatible endpoint Google,
 * поэтому формат запроса идентичен предыдущему.
 */
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
] as const;

type CallResult = { content: string } | { error: string; status: number };

async function callModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
  stream: boolean,
): Promise<Response | CallResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
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

    let lastError = '';

    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      const isLast = i === MODELS.length - 1;

      const result = await callModel(apiKey, model, systemPrompt, messages, isLast);

      // Raw Response — streaming succeeded, pipe through
      if (result instanceof Response) {
        return new Response(result.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-Model': model,
          },
        });
      }

      // Non-streaming success — wrap as SSE
      if ('content' in result) {
        const sseBody = `data: ${JSON.stringify({
          choices: [{ delta: { content: result.content }, finish_reason: 'stop' }],
        })}\n\ndata: [DONE]\n\n`;
        return new Response(sseBody, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-Model': model,
          },
        });
      }

      const retryable = result.status === 429 || result.status >= 500;
      lastError = `[${model}] ${result.error}`;
      console.warn(`[Gemini] ${lastError}${retryable ? ' — trying next model' : ''}`);

      if (!retryable) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
    }

    console.error('[Gemini] All models failed:', lastError);
    return NextResponse.json(
      { error: `All models unavailable. Last: ${lastError}` },
      { status: 503 },
    );

  } catch (err) {
    console.error('[narrative/route] Unhandled error:', err);
    return NextResponse.json({ error: `Internal server error: ${String(err)}` }, { status: 500 });
  }
}
