import type { GameState, Choice, Character } from '@/types';
import { getPresetById } from '@/data/presets';
import { buildSystemPrompt } from '@/lib/buildPrompt';

export interface NarrativeRequest {
  currentSceneId: string;
  choiceId?: string;
  userInput?: string;
  gameState: GameState;
}

export interface NarrativeResponse {
  narratorMessage: string;
  narrativeBlock: string;
  choices: Choice[];
  newCharacters?: Character[];
  worldFlagUpdates?: Record<string, unknown>;
  nextSceneId: string;
  chapterUpdate?: { number: number; title: string };
  isEnding?: boolean;
  endingType?: 'good' | 'neutral' | 'bad';
}

// ─── SSE streaming ────────────────────────────────────────────────────────────

/**
 * Calls /api/narrative and streams the response token-by-token.
 * Calls onToken(chunk) as each piece of text arrives.
 * Returns the full accumulated text when the stream ends.
 */
async function streamFromAPI(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  onToken: (chunk: string) => void,
  retries = 2,
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch('/api/narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, messages }),
    });

    if (!response.ok || !response.body) {
      const err = await response.text().catch(() => '');
      console.error(`[Groq] attempt ${attempt}/${retries} — status:`, response.status, err);
      const retryable = response.status === 402 || response.status === 429 || response.status >= 500;
      if (!retryable || attempt === retries) throw new Error(`LLM error ${response.status}: ${err}`);
      await new Promise(r => setTimeout(r, attempt * 1000));
      continue;
    }

    // Read SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // keep incomplete last line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;

        try {
          const json = JSON.parse(data);
          const chunk: string = json.choices?.[0]?.delta?.content ?? '';
          if (chunk) {
            fullText += chunk;
            onToken(chunk);
          }
        } catch {
          // malformed SSE line — skip
        }
      }
    }

    return fullText;
  }
  throw new Error('LLM: all retries exhausted');
}

// ─── XML parsing ──────────────────────────────────────────────────────────────

function extractTag(text: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, 'i');
  const match = text.match(re);
  if (!match) return null;
  return match[0]
    .replace(new RegExp(`^<${tag}>`, 'i'), '')
    .replace(new RegExp(`<\\/${tag}>$`, 'i'), '')
    .trim();
}

interface ParsedResponse {
  narrative: string;
  chatMessage: string;
  choices: Choice[];
  isEnding: boolean;
  endingType?: 'good' | 'neutral' | 'bad';
}

function parseLLMResponse(raw: string, fallbackTurn: number): ParsedResponse {
  const narrative =
    extractTag(raw, 'NARRATIVE') ??
    raw.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, '').trim().slice(0, 600);

  const chatMessage =
    extractTag(raw, 'CHAT') ??
    narrative.slice(0, 200).split('.').slice(0, 2).join('.') + '.';

  const endingRaw = extractTag(raw, 'ENDING');
  if (endingRaw) {
    let endingType: 'good' | 'neutral' | 'bad' = 'neutral';
    try {
      const parsed = JSON.parse(endingRaw) as { type: string };
      if (['good', 'neutral', 'bad'].includes(parsed.type)) {
        endingType = parsed.type as 'good' | 'neutral' | 'bad';
      }
    } catch {
      const typeMatch = endingRaw.match(/"type"\s*:\s*"(good|neutral|bad)"/);
      if (typeMatch?.[1]) endingType = typeMatch[1] as 'good' | 'neutral' | 'bad';
    }
    return { narrative, chatMessage, choices: [], isEnding: true, endingType };
  }

  const choicesRaw = extractTag(raw, 'CHOICES');
  let choices: Choice[] = [];
  if (choicesRaw) {
    try {
      const parsed = JSON.parse(choicesRaw) as { id?: string; text: string; consequence?: string }[];
      choices = parsed.map((c, i) => ({
        id: c.id ?? `c${i + 1}_t${fallbackTurn}`,
        text: c.text,
        consequence: c.consequence,
        isSelected: false,
        disabled: false,
      }));
    } catch {
      const matches = [...choicesRaw.matchAll(/"text"\s*:\s*"([^"]+)"/g)];
      choices = matches.map((m, i) => ({
        id: `c${i + 1}_t${fallbackTurn}`,
        text: m[1],
        isSelected: false,
        disabled: false,
      }));
    }
  }
  if (choices.length === 0) {
    choices = [
      { id: `c1_t${fallbackTurn}`, text: 'Продолжить', isSelected: false },
      { id: `c2_t${fallbackTurn}`, text: 'Осмотреться', isSelected: false },
    ];
  }
  return { narrative, chatMessage, choices, isEnding: false };
}

function buildResponse(parsed: ParsedResponse, turnCount: number): NarrativeResponse {
  if (parsed.isEnding) {
    const type = parsed.endingType ?? 'neutral';
    return {
      narratorMessage: parsed.chatMessage,
      narrativeBlock: parsed.narrative,
      choices: [],
      nextSceneId: `llm_ending_${type}`,
      isEnding: true,
      endingType: type,
    };
  }
  return {
    narratorMessage: parsed.chatMessage,
    narrativeBlock: parsed.narrative,
    choices: parsed.choices,
    nextSceneId: `llm_turn_${turnCount}`,
    isEnding: false,
  };
}

function buildChatHistory(gameState: GameState): { role: string; content: string }[] {
  return gameState.chatHistory
    .filter((m) => m.content.trim().length > 0)
    .slice(-13)
    .map((m) => ({
      role: m.role === 'narrator' ? 'assistant' : 'user',
      content: m.content,
    }));
}

function buildChoiceMessages(
  choiceId: string,
  gameState: GameState,
): { role: string; content: string }[] {
  const choice = gameState.availableChoices.find((c) => c.id === choiceId);
  const history = buildChatHistory(gameState);
  if (!choice) return history;

  const explicitChoice = {
    role: 'user',
    content: `Мой выбор: "${choice.text}"${choice.consequence ? ` (возможное последствие: ${choice.consequence})` : ''}`,
  };
  const filtered = history.filter((_, i) => i < history.length - 1 || history[history.length - 1]?.role !== 'user');
  return [...filtered, explicitChoice];
}

// ─── Streaming narrative — main export ───────────────────────────────────────

/**
 * Streams the LLM response. Calls onNarrativeChunk() with each new piece
 * of the NARRATIVE section as it arrives (for typewriter in left panel).
 * Returns the full NarrativeResponse once the stream is complete.
 */
export async function streamNarrative(
  userInputOrChoiceId: string,
  gameState: GameState,
  mode: 'input' | 'choice',
  onNarrativeChunk: (chunk: string) => void,
): Promise<NarrativeResponse> {
  const preset = getPresetById(gameState.selectedNarrator);
  if (!preset) throw new Error(`Preset not found: ${gameState.selectedNarrator}`);

  const turnCount = gameState.chatHistory.filter((m) => m.role === 'narrator').length + 1;
  const systemPrompt = buildSystemPrompt(preset, gameState);
  const messages = mode === 'input'
    ? [{ role: 'user', content: userInputOrChoiceId }]
    : buildChoiceMessages(userInputOrChoiceId, gameState);

  // Track whether we're inside the <NARRATIVE> tag
  let buffer = '';
  let narrativeStarted = false;
  let narrativeEnded = false;

  const fullText = await streamFromAPI(systemPrompt, messages, (chunk) => {
    buffer += chunk;

    // Detect <NARRATIVE> open tag
    if (!narrativeStarted && buffer.includes('<NARRATIVE>')) {
      narrativeStarted = true;
      const after = buffer.split('<NARRATIVE>')[1] ?? '';
      if (after) onNarrativeChunk(after);
      return;
    }

    if (narrativeStarted && !narrativeEnded) {
      // Detect </NARRATIVE> close tag
      if (buffer.includes('</NARRATIVE>')) {
        narrativeEnded = true;
        // Emit everything before the closing tag that hasn't been emitted yet
        const beforeClose = buffer.split('</NARRATIVE>')[0];
        const alreadyEmitted = buffer.split('<NARRATIVE>')[1]?.split('</NARRATIVE>')[0] ?? '';
        // Calculate what's new (the chunk itself, since we track per-chunk)
        const newPart = chunk.split('</NARRATIVE>')[0];
        if (newPart && !chunk.startsWith('</')) onNarrativeChunk(newPart);
        return;
      }
      // Still inside NARRATIVE — emit the chunk directly
      onNarrativeChunk(chunk);
    }
  });

  return buildResponse(parseLLMResponse(fullText, turnCount), turnCount);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getInitialNarrative(): Promise<NarrativeResponse> {
  const { useGameStore } = await import('@/stores/gameStore');
  const state = useGameStore.getState();
  const preset = getPresetById(state.selectedNarrator);
  const greeting = preset?.initialMessage ?? 'Расскажи, с чего начинается твоя история.';
  return {
    narratorMessage: greeting,
    narrativeBlock: '',
    choices: [],
    nextSceneId: 'scene_intro',
  };
}

export function isEndingScene(sceneId: string): boolean {
  return sceneId.startsWith('llm_ending_');
}

export function getEndingInfo(
  sceneId: string
): { type: 'good' | 'neutral' | 'bad'; title?: string } | undefined {
  if (!isEndingScene(sceneId)) return undefined;
  const type = sceneId.replace('llm_ending_', '') as 'good' | 'neutral' | 'bad';
  if (!['good', 'neutral', 'bad'].includes(type)) return undefined;
  return { type };
}

export function getScenePreview(_sceneId: string): string { return 'Продолжение истории...'; }
export function isValidTransition(_f: string, _t: string): boolean { return true; }
export function getSceneChoices(_sceneId: string): Choice[] { return []; }
