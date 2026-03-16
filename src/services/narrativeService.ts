import type { GameState, Choice, Character } from '@/types';
import { generateShortId } from '@/utils/generateId';
import {
  getScene,
  getStartingScene,
  type MockScene,
  type MockChoice,
} from '@/data/mockNarrative';

/**
 * Request structure for narrative generation
 */
export interface NarrativeRequest {
  currentSceneId: string;
  choiceId?: string;
  userInput?: string;
  gameState: GameState;
}

/**
 * Response structure for narrative generation
 */
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

/**
 * Simulate network delay for LLM-like experience
 * @param minMs - Minimum delay in milliseconds
 * @param maxMs - Maximum delay in milliseconds
 */
function simulateDelay(minMs: number = 300, maxMs: number = 800): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Convert mock choices to game choices with IDs
 * @param mockChoices - Mock choices from the scene
 * @returns Array of game choices
 */
function convertToGameChoices(mockChoices: MockChoice[]): Choice[] {
  return mockChoices.map((mc) => ({
    id: mc.id,
    text: mc.text,
    isSelected: false,
    consequence: mc.consequenceHint,
  }));
}

/**
 * Find the next scene ID based on the selected choice
 * @param scene - Current scene
 * @param choiceId - Selected choice ID
 * @returns Next scene ID or undefined
 */
function findNextSceneId(scene: MockScene, choiceId: string): string | undefined {
  console.log('[DEBUG] findNextSceneId called with:', { sceneId: scene.id, choiceId, choices: scene.choices.map(c => ({ id: c.id, nextSceneId: c.nextSceneId })) });
  const choice = scene.choices.find((c) => c.id === choiceId);
  console.log('[DEBUG] Found choice:', choice);
  return choice?.nextSceneId;
}

/**
 * Generate a contextual intro response based on user input
 * @param userInput - User's initial input
 * @param scene - The intro scene
 * @returns Modified narrative block
 */
function generateContextualIntro(userInput: string, scene: MockScene): string {
  // Parse user input for context
  const inputLower = userInput.toLowerCase();
  
  // Add personalization based on user input
  let personalization = '';
  
  if (inputLower.includes('кто') || inputLower.includes('имя')) {
    personalization = '\n\nТы пытаешься вспомнить своё имя, но память молчит. Быть может, оно вернётся позже — или ты выберешь новое.';
  }
  
  if (inputLower.includes('где') || inputLower.includes('место')) {
    personalization += '\n\nТы оглядываешься вокруг, пытаясь понять, где находишься. Лес кажется знакомым и чужим одновременно.';
  }
  
  if (inputLower.includes('амулет') || inputLower.includes('камень')) {
    personalization += '\n\nКамень в амулете пульсирует в такт твоему сердцу, словно живой.';
  }
  
  return scene.narrativeBlock + personalization;
}

/**
 * Generate narrative response based on the current game state and player choice
 * @param request - Narrative request with current state and choice
 * @returns Promise with narrative response
 */
export async function generateNarrative(request: NarrativeRequest): Promise<NarrativeResponse> {
  // Simulate LLM delay
  await simulateDelay();

  const { currentSceneId, choiceId, userInput, gameState } = request;

  // Handle the intro scene with user input
  if (currentSceneId === 'scene_intro' && userInput) {
    const introScene = getStartingScene();
    
    return {
      narratorMessage: introScene.narratorMessage,
      narrativeBlock: generateContextualIntro(userInput, introScene),
      choices: convertToGameChoices(introScene.choices),
      newCharacters: introScene.newCharacters,
      worldFlagUpdates: introScene.worldFlagUpdates,
      nextSceneId: introScene.id,
      chapterUpdate: introScene.chapterTitle 
        ? { number: introScene.chapterNumber, title: introScene.chapterTitle }
        : undefined,
    };
  }

  // Get the current scene
  const currentScene = getScene(currentSceneId);
  
  if (!currentScene) {
    throw new Error(`Scene not found: ${currentSceneId}`);
  }

  // If there's a choice, find the next scene
  let nextSceneId = currentSceneId;
  
  if (choiceId) {
    const nextId = findNextSceneId(currentScene, choiceId);
    if (nextId) {
      nextSceneId = nextId;
    } else {
      console.warn(`Choice ${choiceId} not found in scene ${currentSceneId}`);
    }
  }

  // Get the next scene
  const nextScene = getScene(nextSceneId);
  
  if (!nextScene) {
    throw new Error(`Next scene not found: ${nextSceneId}`);
  }

  // Check for chapter update
  const chapterUpdate = nextScene.chapterTitle
    ? { number: nextScene.chapterNumber, title: nextScene.chapterTitle }
    : undefined;

  // Build the response
  const response: NarrativeResponse = {
    narratorMessage: nextScene.narratorMessage,
    narrativeBlock: nextScene.narrativeBlock,
    choices: convertToGameChoices(nextScene.choices),
    newCharacters: nextScene.newCharacters,
    worldFlagUpdates: nextScene.worldFlagUpdates,
    nextSceneId: nextScene.id,
    chapterUpdate,
    isEnding: nextScene.isEnding,
    endingType: nextScene.endingType,
  };

  return response;
}

/**
 * Get the initial narrative for starting a new game
 * @returns Promise with initial narrative response
 */
export async function getInitialNarrative(): Promise<NarrativeResponse> {
  // Shorter delay for initial narrative
  await simulateDelay(200, 500);

  const introScene = getStartingScene();

  return {
    narratorMessage: introScene.narratorMessage,
    narrativeBlock: introScene.narrativeBlock,
    choices: convertToGameChoices(introScene.choices),
    newCharacters: introScene.newCharacters,
    worldFlagUpdates: introScene.worldFlagUpdates,
    nextSceneId: introScene.id,
    chapterUpdate: introScene.chapterTitle
      ? { number: introScene.chapterNumber, title: introScene.chapterTitle }
      : undefined,
  };
}

/**
 * Process a player choice and get the next narrative
 * @param currentSceneId - Current scene ID
 * @param choiceId - Selected choice ID
 * @param gameState - Current game state
 * @returns Promise with next narrative response
 */
export async function processChoice(
  currentSceneId: string,
  choiceId: string,
  gameState: GameState
): Promise<NarrativeResponse> {
  return generateNarrative({
    currentSceneId,
    choiceId,
    gameState,
  });
}

/**
 * Process user input for the intro scene
 * @param userInput - User's input text
 * @param gameState - Current game state
 * @returns Promise with narrative response
 */
export async function processUserInput(
  userInput: string,
  gameState: GameState
): Promise<NarrativeResponse> {
  return generateNarrative({
    currentSceneId: 'scene_intro',
    userInput,
    gameState,
  });
}

/**
 * Check if a scene is an ending scene
 * @param sceneId - Scene ID to check
 * @returns True if it's an ending scene
 */
export function isEndingScene(sceneId: string): boolean {
  const scene = getScene(sceneId);
  console.log('[DEBUG] isEndingScene called with:', { sceneId, found: !!scene, isEnding: scene?.isEnding });
  return scene?.isEnding ?? false;
}

/**
 * Get ending information
 * @param sceneId - Scene ID
 * @returns Ending type or undefined
 */
export function getEndingInfo(sceneId: string): { type: 'good' | 'neutral' | 'bad'; title?: string } | undefined {
  const scene = getScene(sceneId);
  console.log('[DEBUG] getEndingInfo called with:', { sceneId, scene: scene ? { isEnding: scene.isEnding, endingType: scene.endingType } : null });
  
  if (!scene?.isEnding || !scene.endingType) {
    return undefined;
  }
  
  return {
    type: scene.endingType,
    title: scene.chapterTitle,
  };
}

/**
 * Get scene preview text for save slots
 * @param sceneId - Scene ID
 * @returns Preview text
 */
export function getScenePreview(sceneId: string): string {
  const scene = getScene(sceneId);
  return scene?.narrativeBlock.slice(0, 100) || 'Начало приключения';
}

/**
 * Validate that a transition between scenes is allowed
 * @param fromSceneId - Current scene ID
 * @param toSceneId - Target scene ID
 * @returns True if transition is valid
 */
export function isValidTransition(fromSceneId: string, toSceneId: string): boolean {
  const fromScene = getScene(fromSceneId);
  
  if (!fromScene) return false;
  
  // Check if target scene is in the choices
  return fromScene.choices.some((c) => c.nextSceneId === toSceneId);
}

/**
 * Get all available choices for a scene
 * @param sceneId - Scene ID
 * @returns Array of choices or empty array
 */
export function getSceneChoices(sceneId: string): Choice[] {
  const scene = getScene(sceneId);
  
  if (!scene) return [];
  
  return convertToGameChoices(scene.choices);
}
