import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS         = 30_000;

/**
 * Provider map (March 2026):
 *   NVIDIA  → nvidia/nemotron-3-super-120b-a12b
 *   Alibaba → qwen/qwen3-next-80b-a3b-instruct
 *   Venice  → meta-llama/llama-3.3-70b-instruct, mistralai/mistral-small-3.1-24b
 *   OR auto → openrouter/free
 */
const MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'openrouter/free',
] as const;

type CallResult = { content: string } | { error: string; status: number };

// ─── Non-streaming fallback (used internally to try next model) ───────────────

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
    response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://gennarrative.app',
        'X-Title': 'GenNarrative',
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

  // If streaming requested, return the raw Response for the caller to pipe
  if (stream) return response;

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content) return { error: 'Empty content in response', status: 503 };
  return { content };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not set' }, { status: 500 });
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

    // ── Try each model; first that succeeds streams back SSE ─────────────────
    let lastError = '';

    for (let i = 0; i < MODELS.length; i++) {
      const model = MODELS[i];
      const isLast = i === MODELS.length - 1;

      // Last model gets streaming; earlier ones are tested non-streaming first
      // so we can quickly skip rate-limited ones without opening a stream
      const result = await callModel(apiKey, model, systemPrompt, messages, isLast ? true : false);

      // Raw Response means streaming succeeded — pipe it through
      if (result instanceof Response) {
        return new Response(result.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-Model': model,
          },
        });
      }

      // CallResult with content means non-streaming success — wrap as SSE
      if ('content' in result) {
        // Emit the full content as a single SSE event so the client
        // can use the same parsing logic regardless
        const sseBody = `data: ${JSON.stringify({ choices: [{ delta: { content: result.content }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`;
        return new Response(sseBody, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-Model': model,
          },
        });
      }

      // Error — decide whether to retry
      const retryable = result.status === 402 || result.status === 429 || result.status >= 500;
      lastError = `[${model}] ${result.error}`;
      console.warn(`[OpenRouter] ${lastError}${retryable ? ' — trying next model' : ''}`);

      if (!retryable) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      // On the second-to-last model, switch to streaming for the last attempt
      // (already handled above by isLast check)
    }

    console.error('[OpenRouter] All models failed:', lastError);
    return NextResponse.json({ error: `All models unavailable. Last: ${lastError}` }, { status: 503 });

  } catch (err) {
    console.error('[narrative/route] Unhandled error:', err);
    return NextResponse.json({ error: `Internal server error: ${String(err)}` }, { status: 500 });
  }
}
