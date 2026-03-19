import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  NarrativeBlock,
  ChatMessage,
  Choice,
  Decision,
  Character,
  EntityMemory,
  SaveSlot,
  EndingType,
} from '@/types';
import { DEFAULT_GAME_STATE } from '@/types';
import { PresetId } from '@/types';
import { generateId } from '@/utils/generateId';
import { loadSlot } from '@/services/saveService';

interface GameActions {
  // Game lifecycle
  startNewGame: (narratorId: PresetId, slotIndex: number) => void;
  loadGame: (slotIndex: number) => void;
  saveGame: (slotName: string) => void;
  deleteSaveSlot: (slotId: string) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Slot selection
  setSelectedSlot: (index: number) => void;

  // Ending
  setEnding: (endingId: EndingType) => void;
  
  // Narrative
  addNarrativeBlock: (block: Omit<NarrativeBlock, 'id' | 'timestamp'>) => void;
  updateCurrentNarrative: (content: string) => void;
  clearNarrative: () => void;
  
  // Chat
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  
  // Choices
  setAvailableChoices: (choices: (Omit<Choice, 'id' | 'isSelected'> & { id?: string })[]) => void;
  makeChoice: (choiceId: string) => void;
  clearChoices: () => void;
  
  // Chapter management
  updateChapter: (chapter: number) => void;
  setTotalChapters: (total: number) => void;
  
  // Characters
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  unlockCharacter: (characterId: string) => void;
  
  // World state
  setCurrentLocation: (location: string) => void;
  addVisitedLocation: (location: string) => void;
  updateEntityMemory: (entityId: string, updates: Partial<EntityMemory>) => void;
  
  // Narrator
  setNarrator: (narratorId: PresetId) => void;
  
  // Session
  updatePlayTime: () => void;
}

interface GameStore extends GameState, GameActions {}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
  // Default state
  ...DEFAULT_GAME_STATE,
  
  // Game lifecycle actions
  startNewGame: (narratorId, slotIndex) => {
    set({
      ...DEFAULT_GAME_STATE,
      isGameStarted: true,
      isGamePaused: false,
      selectedNarrator: narratorId,
      selectedSlotIndex: slotIndex,
      sessionStartTime: Date.now(),
      narrativeBlocks: [],
      chatHistory: [],
      decisions: [],
      currentChapter: 1,
    });
  },

  setSelectedSlot: (index) => {
    set({ selectedSlotIndex: index });
  },
  
  loadGame: (slotIndex) => {
    const slot = loadSlot(slotIndex);
    if (!slot || !slot.gameState) return;

    set({
      isGameStarted: true,
      isGamePaused: false,
      isFinished: slot.gameState.isFinished || false,
      endingId: slot.gameState.endingId || null,
      currentChapter: slot.gameState.currentChapter || 1,
      decisions: slot.gameState.decisions || [],
      narrativeBlocks: slot.gameState.narrativeBlocks || [],
      chatHistory: slot.gameState.chatHistory || [],
      characters: slot.gameState.characters || [],
      currentLocation: slot.gameState.currentLocation || '',
      visitedLocations: slot.gameState.visitedLocations || [],
      selectedNarrator: slot.gameState.selectedNarrator || 'knight',
      currentNarrative: slot.gameState.currentNarrative || '',
      selectedSlotIndex: slot.gameState.selectedSlotIndex ?? (slotIndex > 0 ? slotIndex : null),
      sessionStartTime: Date.now(),
      totalPlayTime: slot.playTime,
    });
  },
  
  saveGame: (slotName) => {
    const state = get();
    const now = Date.now();
    
    // Calculate play time
    const sessionTime = state.sessionStartTime ? now - state.sessionStartTime : 0;
    const totalPlayTime = state.totalPlayTime + sessionTime;
    
    const newSlot: SaveSlot = {
      id: generateId(),
      name: slotName,
      timestamp: now,
      chapter: state.currentChapter,
      preview: state.currentNarrative.slice(0, 100) || 'Начало игры',
      playTime: totalPlayTime,
      decisions: state.decisions,
    };
    
    set((prev) => ({
      saveSlots: [...prev.saveSlots.filter(s => s.id !== prev.currentSlotId), newSlot],
      currentSlotId: newSlot.id,
      lastSaveTime: now,
      totalPlayTime,
      sessionStartTime: now,
    }));
  },
  
  deleteSaveSlot: (slotId) => {
    set((prev) => ({
      saveSlots: prev.saveSlots.filter(s => s.id !== slotId),
      currentSlotId: prev.currentSlotId === slotId ? null : prev.currentSlotId,
    }));
  },
  
  pauseGame: () => {
    set({ isGamePaused: true });
  },
  
  resumeGame: () => {
    set((prev) => ({
      isGamePaused: false,
      sessionStartTime: prev.sessionStartTime ? Date.now() : null,
    }));
  },
  
  endGame: () => {
    set(DEFAULT_GAME_STATE);
  },
  
  resetGame: () => {
    // Reset game state completely for a new game
    set(DEFAULT_GAME_STATE);
  },
  
  // Ending actions
  setEnding: (endingId) => {
    set({
      isFinished: true,
      endingId,
      isGamePaused: true,
    });
  },
  
  // Narrative actions
  addNarrativeBlock: (block) => {
    const newBlock: NarrativeBlock = {
      ...block,
      id: generateId(),
      timestamp: Date.now(),
    };
    set((prev) => ({
      narrativeBlocks: [...prev.narrativeBlocks, newBlock],
    }));
  },
  
  updateCurrentNarrative: (content) => {
    set({ currentNarrative: content });
  },
  
  clearNarrative: () => {
    set({ narrativeBlocks: [], currentNarrative: '' });
  },
  
  // Chat actions
  addChatMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
    };
    set((prev) => ({
      chatHistory: [...prev.chatHistory, newMessage],
    }));
  },
  
  clearChatHistory: () => {
    set({ chatHistory: [] });
  },
  
  // Choice actions
  setAvailableChoices: (choices) => {
    const formattedChoices: Choice[] = choices.map(choice => ({
      ...choice,
      // Preserve original ID if it exists (needed for scene navigation)
      id: choice.id || generateId(),
      isSelected: false,
    }));
    set({ availableChoices: formattedChoices });
  },
  
  makeChoice: (choiceId) => {
    const state = get();
    const choice = state.availableChoices.find(c => c.id === choiceId);
    if (!choice) return;
    
    const decision: Decision = {
      id: generateId(),
      choiceId: choice.id,
      choiceText: choice.text,
      chapter: state.currentChapter,
      timestamp: Date.now(),
      consequence: choice.consequence,
    };
    
    set((prev) => ({
      availableChoices: prev.availableChoices.map(c => ({
        ...c,
        isSelected: c.id === choiceId,
        disabled: true,
      })),
      decisions: [...prev.decisions, decision],
    }));
  },
  
  clearChoices: () => {
    set({ availableChoices: [] });
  },
  
  // Chapter actions
  updateChapter: (chapter) => {
    set({ currentChapter: chapter });
  },
  
  setTotalChapters: (total) => {
    set({ totalChapters: total });
  },
  
  // Character actions
  addCharacter: (character) => {
    set((prev) => ({
      characters: [...prev.characters.filter(c => c.id !== character.id), character],
    }));
  },
  
  updateCharacter: (characterId, updates) => {
    set((prev) => ({
      characters: prev.characters.map(c =>
        c.id === characterId ? { ...c, ...updates } : c
      ),
    }));
  },
  
  unlockCharacter: (characterId) => {
    set((prev) => ({
      characters: prev.characters.map(c =>
        c.id === characterId ? { ...c, isUnlocked: true } : c
      ),
    }));
  },
  
  // World state actions
  setCurrentLocation: (location) => {
    set((prev) => ({
      currentLocation: location,
      visitedLocations: prev.visitedLocations.includes(location)
        ? prev.visitedLocations
        : [...prev.visitedLocations, location],
    }));
  },
  
  addVisitedLocation: (location) => {
    set((prev) => ({
      visitedLocations: prev.visitedLocations.includes(location)
        ? prev.visitedLocations
        : [...prev.visitedLocations, location],
    }));
  },
  
  updateEntityMemory: (entityId, updates) => {
    set((prev) => {
      const existing = prev.entityMemory[entityId];
      const updated: EntityMemory = existing
        ? { ...existing, ...updates, lastMentioned: Date.now(), mentionCount: existing.mentionCount + 1 }
        : {
            entityId,
            entityType: 'character',
            name: '',
            description: '',
            lastMentioned: Date.now(),
            mentionCount: 1,
            relationships: {},
            ...updates,
          };
      return {
        entityMemory: { ...prev.entityMemory, [entityId]: updated },
      };
    });
  },
  
  // Narrator actions
  setNarrator: (narratorId) => {
    set({ selectedNarrator: narratorId });
  },
  
  // Session actions
  updatePlayTime: () => {
    const state = get();
    if (state.sessionStartTime) {
      const sessionTime = Date.now() - state.sessionStartTime;
      set({
        totalPlayTime: state.totalPlayTime + sessionTime,
        sessionStartTime: Date.now(),
      });
    }
  },
}),
    {
      name: 'visual-novel-game-state',
      partialize: (state) => ({
        isGameStarted: state.isGameStarted,
        isFinished: state.isFinished,
        endingId: state.endingId,
        selectedNarrator: state.selectedNarrator,
        selectedSlotIndex: state.selectedSlotIndex,
        currentChapter: state.currentChapter,
        totalChapters: state.totalChapters,
        chatHistory: state.chatHistory,
        narrativeBlocks: state.narrativeBlocks,
        decisions: state.decisions,
        characters: state.characters,
        currentLocation: state.currentLocation,
        visitedLocations: state.visitedLocations,
        currentNarrative: state.currentNarrative,
        totalPlayTime: state.totalPlayTime,
        availableChoices: state.availableChoices,
        saveSlots: state.saveSlots,
      }),
    }
  )
);

// Selectors
export const selectIsGameStarted = (state: GameStore) => state.isGameStarted;
export const selectCurrentChapter = (state: GameStore) => state.currentChapter;
export const selectNarrativeBlocks = (state: GameStore) => state.narrativeBlocks;
export const selectChatHistory = (state: GameStore) => state.chatHistory;
export const selectAvailableChoices = (state: GameStore) => state.availableChoices;
export const selectDecisions = (state: GameStore) => state.decisions;
export const selectCharacters = (state: GameStore) => state.characters;
export const selectSelectedNarrator = (state: GameStore) => state.selectedNarrator;
export const selectSaveSlots = (state: GameStore) => state.saveSlots;
export const selectIsFinished = (state: GameStore) => state.isFinished;
export const selectEndingId = (state: GameStore) => state.endingId;
export const selectSelectedSlotIndex = (state: GameStore) => state.selectedSlotIndex;
