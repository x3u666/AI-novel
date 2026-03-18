import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not set in environment variables' },
      { status: 500 }
    );
  }

  let body: { systemPrompt: string; messages: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { systemPrompt, messages } = body;

  const groqResponse = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1200,
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  if (!groqResponse.ok) {
    const errorText = await groqResponse.text();
    console.error('[Groq API error]', groqResponse.status, errorText);
    return NextResponse.json(
      { error: `Groq API error ${groqResponse.status}: ${errorText}` },
      { status: groqResponse.status }
    );
  }

  const data = await groqResponse.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';

  return NextResponse.json({ content });
}