import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS         = 30_000;

/**
 * Fallback chain — only large, reliable models that handle Russian and
 * follow complex XML prompts. Ordered by response speed.
 *
 * 1. meta-llama/llama-3.3-70b-instruct:free  — primary, best Russian support
 * 2. mistralai/mistral-small-3.1-24b-instruct:free — fast, reliable fallback
 * 3. nvidia/nemotron-3-super-120b-a12b:free  — strong quality, different provider
 * 4. openrouter/free                          — OR auto-router, last resort
 */
/**
 * Provider map (March 2026):
 *   NVIDIA  → nvidia/nemotron-3-super-120b-a12b
 *   Alibaba → qwen/qwen3-next-80b-a3b-instruct
 *   Venice  → meta-llama/llama-3.3-70b-instruct, mistralai/mistral-small-3.1-24b
 *   OR auto → openrouter/free
 *
 * Non-Venice providers come first so a Venice rate-limit doesn't block
 * the first two slots simultaneously.
 */
const MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'openrouter/free',
] as const;

type CallResult = { content: string; model: string } | { error: string; status: number };

async function callModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
): Promise<CallResult> {
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

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content) {
    return { error: 'Empty content in response', status: 503 };
  }
  return { content, model };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not set' },
        { status: 500 },
      );
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
        { status: 400 },
      );
    }

    let lastError = '';
    for (const model of MODELS) {
      const result = await callModel(apiKey, model, systemPrompt, messages);

      if ('content' in result) {
        return NextResponse.json({ content: result.content });
      }

      const retryable = result.status === 402 || result.status === 429 || result.status >= 500;
      lastError = `[${model}] ${result.error}`;
      console.warn(`[OpenRouter] ${lastError}${retryable ? ' — trying next model' : ''}`);

      if (!retryable) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
    }

    console.error('[OpenRouter] All models failed:', lastError);
    return NextResponse.json(
      { error: `All models unavailable. Last: ${lastError}` },
      { status: 503 },
    );

  } catch (err) {
    console.error('[narrative/route] Unhandled error:', err);
    return NextResponse.json(
      { error: `Internal server error: ${String(err)}` },
      { status: 500 },
    );
  }
}
