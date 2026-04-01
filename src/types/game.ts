import { PresetId } from './narrator';

export type EndingType = 'good' | 'neutral' | 'bad';

export interface NarrativeBlock {
  id: string;
  content: string;
  timestamp: number;
  type: 'narration' | 'dialogue' | 'description' | 'action';
  characterId?: string;
  isTyping?: boolean;
  chapter?: number; // chapter number at the time this block was added
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'narrator';
  content: string;
  timestamp: number;
  characterId?: string;
  isTyping?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  isSelected: boolean;
  consequence?: string;
  disabled?: boolean;
}

export interface DecisionChoice {
  id: string;
  text: string;
  consequence?: string;
}

export interface Decision {
  id: string;
  choiceId: string;
  choiceText: string;
  chapter: number;
  timestamp: number;
  consequence?: string;
  allChoices?: DecisionChoice[]; // all options available at this decision point
  isCustomInput?: boolean; // true if user typed their own response
}

export interface Character {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  traits: string[];
  relationships: Record<string, number>;
  isUnlocked: boolean;
}

export interface EntityMemory {
  entityId: string;
  entityType: 'character' | 'location' | 'item' | 'event';
  name: string;
  description: string;
  lastMentioned: number;
  mentionCount: number;
  relationships: Record<string, string>;
}

export interface NPCMemory {
  name: string;
  attitude: number; // -100..+100
  lastAction: string; // краткое описание последнего взаимодействия
}

export interface WorldState {
  heroName: string;
  heroGoal: string;
  currentLocation: string;
  keyFacts: string[]; // до 10 фактов
  npcMemory: Record<string, NPCMemory>; // ключ — имя NPC
  karma: number; // -100..+100
}

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  chapter: number;
  preview: string;
  thumbnail?: string;
  playTime: number;
  decisions: Decision[];
  narratorId: PresetId | null;
  gameState?: Partial<GameState>; // Store essential game state for loading
}

export interface GameState {
  // Core game data
  isGameStarted: boolean;
  isGamePaused: boolean;
  currentChapter: number;
  totalChapters: number;
  
  // Narrative state
  narrativeBlocks: NarrativeBlock[];
  chatHistory: ChatMessage[];
  currentNarrative: string;
  
  // Choices and decisions
  availableChoices: Choice[];
  decisions: Decision[];
  
  // Character and world state
  characters: Character[];
  currentLocation: string;
  visitedLocations: string[];
  entityMemory: Record<string, EntityMemory>;
  worldState: WorldState;
  
  // Narrator
  selectedNarrator: PresetId;
  
  // Ending state
  isFinished: boolean;
  endingId: EndingType | null;
  
  // Save/Load
  saveSlots: SaveSlot[];
  currentSlotId: string | null;
  selectedSlotIndex: number | null; // slot 1-3 chosen at new game start

  // Session data
  sessionStartTime: number | null;
  totalPlayTime: number;
  lastSaveTime: number | null;
}

export const DEFAULT_GAME_STATE: GameState = {
  isGameStarted: false,
  isGamePaused: false,
  currentChapter: 1,
  totalChapters: 10,
  
  narrativeBlocks: [],
  chatHistory: [],
  currentNarrative: '',
  
  availableChoices: [],
  decisions: [],
  
  characters: [],
  currentLocation: '',
  visitedLocations: [],
  entityMemory: {},
  worldState: {
    heroName: '',
    heroGoal: '',
    currentLocation: '',
    keyFacts: [],
    npcMemory: {},
    karma: 0,
  },
  
  selectedNarrator: 'neutral',
  
  isFinished: false,
  endingId: null,
  
  saveSlots: [],
  currentSlotId: null,
  selectedSlotIndex: null,

  sessionStartTime: null,
  totalPlayTime: 0,
  lastSaveTime: null,
};
