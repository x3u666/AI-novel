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

async function callGroq(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  retries = 2
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch('/api/narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, messages }),
    });
    if (response.ok) {
      const data = await response.json();
      return (data.content as string) ?? '';
    }
    const err = await response.text();
    console.error(`[callGroq] attempt ${attempt}/${retries} — status:`, response.status, 'body:', err);
    // Retry on network errors (502) but not on auth/client errors
    if (response.status !== 502 || attempt === retries) {
      throw new Error(`Groq API error ${response.status}: ${err}`);
    }
    // Wait 1s before retry
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Groq: all retries exhausted');
}

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
    .slice(-20)
    .map((m) => ({
      role: m.role === 'narrator' ? 'assistant' : 'user',
      content: m.content,
    }));
}

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

export async function processUserInput(
  userInput: string,
  gameState: GameState
): Promise<NarrativeResponse> {
  const preset = getPresetById(gameState.selectedNarrator);
  if (!preset) throw new Error(`Preset not found: ${gameState.selectedNarrator}`);
  const turnCount = gameState.chatHistory.filter((m) => m.role === 'narrator').length + 1;
  const systemPrompt = buildSystemPrompt(preset, gameState);
  const raw = await callGroq(systemPrompt, [{ role: 'user', content: userInput }]);
  return buildResponse(parseLLMResponse(raw, turnCount), turnCount);
}

export async function processChoice(
  _currentSceneId: string,
  _choiceId: string,
  gameState: GameState
): Promise<NarrativeResponse> {
  const preset = getPresetById(gameState.selectedNarrator);
  if (!preset) throw new Error(`Preset not found: ${gameState.selectedNarrator}`);
  const turnCount = gameState.chatHistory.filter((m) => m.role === 'narrator').length + 1;
  const systemPrompt = buildSystemPrompt(preset, gameState);
  const raw = await callGroq(systemPrompt, buildChatHistory(gameState));
  return buildResponse(parseLLMResponse(raw, turnCount), turnCount);
}

export async function generateNarrative(request: NarrativeRequest): Promise<NarrativeResponse> {
  const { currentSceneId, choiceId, userInput, gameState } = request;
  if (currentSceneId === 'scene_intro' && userInput) {
    return processUserInput(userInput, gameState);
  }
  return processChoice(currentSceneId, choiceId ?? '', gameState);
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