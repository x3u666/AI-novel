import { PresetId } from './narrator';

export type EndingType = 'good' | 'neutral' | 'bad';

export interface NarrativeBlock {
  id: string;
  content: string;
  timestamp: number;
  type: 'narration' | 'dialogue' | 'description' | 'action';
  characterId?: string;
  isTyping?: boolean;
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

export interface Decision {
  id: string;
  choiceId: string;
  choiceText: string;
  chapter: number;
  timestamp: number;
  consequence?: string;
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

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  chapter: number;
  preview: string;
  thumbnail?: string;
  playTime: number;
  decisions: Decision[];
  narratorId: PresetId;
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
  
  // Narrator
  selectedNarrator: PresetId;
  
  // Ending state
  isFinished: boolean;
  endingId: EndingType | null;
  
  // Save/Load
  saveSlots: SaveSlot[];
  currentSlotId: string | null;
  
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
  
  selectedNarrator: 'neutral',
  
  isFinished: false,
  endingId: null,
  
  saveSlots: [],
  currentSlotId: null,
  
  sessionStartTime: null,
  totalPlayTime: 0,
  lastSaveTime: null,
};
