import type { SaveSlot, GameState, Decision } from '@/types';
import { generateShortId } from '@/utils/generateId';

/**
 * Save slot keys for localStorage
 * Index 0 is reserved for auto-save
 */
export const SAVE_SLOT_KEYS = ['save_slot_0', 'save_slot_1', 'save_slot_2', 'save_slot_3'] as const;

/**
 * Save slot metadata stored separately for quick access
 */
interface SaveSlotMetadata {
  id: string;
  name: string;
  timestamp: number;
  chapter: number;
  preview: string;
  thumbnail?: string;
  playTime: number;
  isAutoSave: boolean;
}

const METADATA_KEY = 'save_slots_metadata';

/**
 * Check if localStorage is available
 * @returns True if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all save slot metadata
 * @returns Array of save slot metadata
 */
function getMetadata(): SaveSlotMetadata[] {
  if (!isLocalStorageAvailable()) return [];
  
  try {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save metadata to localStorage
 * @param metadata - Array of save slot metadata
 */
function saveMetadata(metadata: SaveSlotMetadata[]): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to save metadata:', error);
  }
}

/**
 * Load a save slot by index
 * @param index - Slot index (0-3)
 * @returns SaveSlot or null if not found
 */
export function loadSlot(index: number): SaveSlot | null {
  if (!isLocalStorageAvailable()) return null;
  if (index < 0 || index >= SAVE_SLOT_KEYS.length) return null;
  
  try {
    const key = SAVE_SLOT_KEYS[index];
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const parsed = JSON.parse(data) as SaveSlot;
    return parsed;
  } catch (error) {
    console.error(`Failed to load slot ${index}:`, error);
    return null;
  }
}

/**
 * Save game state to a slot
 * @param index - Slot index (0-3)
 * @param gameState - Current game state
 * @param customName - Optional custom name for the save
 * @returns The created SaveSlot
 */
export function saveSlot(index: number, gameState: GameState, customName?: string): SaveSlot {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }
  
  if (index < 0 || index >= SAVE_SLOT_KEYS.length) {
    throw new Error(`Invalid slot index: ${index}`);
  }
  
  const now = Date.now();
  const isAutoSave = index === 0;
  
  // Calculate total play time
  const sessionTime = gameState.sessionStartTime ? now - gameState.sessionStartTime : 0;
  const totalPlayTime = gameState.totalPlayTime + sessionTime;
  
  // Generate save name
  const defaultName = isAutoSave 
    ? 'Автосохранение' 
    : `Сохранение ${index}`;
  const name = customName || defaultName;
  
  // Create preview text from narrative
  const preview = gameState.currentNarrative.slice(0, 100) || 
    gameState.narrativeBlocks.slice(-1)[0]?.content.slice(0, 100) || 
    'Начало приключения';
  
  // Create the save slot with game state
  const slot: SaveSlot = {
    id: generateShortId(),
    name,
    timestamp: now,
    chapter: gameState.currentChapter,
    preview,
    playTime: totalPlayTime,
    decisions: gameState.decisions,
    narratorId: gameState.selectedNarrator,
    gameState: {
      narrativeBlocks: gameState.narrativeBlocks,
      chatHistory: gameState.chatHistory,
      currentNarrative: gameState.currentNarrative,
      characters: gameState.characters,
      currentLocation: gameState.currentLocation,
      visitedLocations: gameState.visitedLocations,
      decisions: gameState.decisions,
      currentChapter: gameState.currentChapter,
      selectedNarrator: gameState.selectedNarrator,
    },
  };
  
  try {
    // Save the full game state
    const key = SAVE_SLOT_KEYS[index];
    localStorage.setItem(key, JSON.stringify(slot));
    
    // Update metadata
    const metadata = getMetadata();
    const existingIndex = metadata.findIndex(m => m.slotIndex === index);
    
    const newMetadata: SaveSlotMetadata & { slotIndex: number } = {
      id: slot.id,
      name: slot.name,
      timestamp: slot.timestamp,
      chapter: slot.chapter,
      preview: slot.preview,
      thumbnail: slot.thumbnail,
      playTime: slot.playTime,
      isAutoSave,
      slotIndex: index,
    };
    
    if (existingIndex >= 0) {
      metadata[existingIndex] = newMetadata;
    } else {
      metadata.push(newMetadata);
    }
    
    saveMetadata(metadata);
    
    return slot;
  } catch (error) {
    console.error(`Failed to save slot ${index}:`, error);
    throw error;
  }
}

/**
 * Delete a save slot
 * @param index - Slot index (0-3)
 */
export function deleteSlot(index: number): void {
  if (!isLocalStorageAvailable()) return;
  if (index < 0 || index >= SAVE_SLOT_KEYS.length) return;
  
  try {
    const key = SAVE_SLOT_KEYS[index];
    localStorage.removeItem(key);
    
    // Update metadata
    const metadata = getMetadata();
    const filtered = metadata.filter(m => m.slotIndex !== index);
    saveMetadata(filtered);
  } catch (error) {
    console.error(`Failed to delete slot ${index}:`, error);
  }
}

/**
 * Rename a manual save slot
 * @param index - Slot index (1-3, cannot rename auto-save)
 * @param newName - New name for the slot
 */
export function renameSlot(index: number, newName: string): void {
  if (!isLocalStorageAvailable()) return;
  if (index <= 0 || index >= SAVE_SLOT_KEYS.length) {
    throw new Error('Cannot rename auto-save slot or invalid index');
  }
  
  const slot = loadSlot(index);
  if (!slot) {
    throw new Error(`Slot ${index} does not exist`);
  }
  
  const updatedSlot: SaveSlot = {
    ...slot,
    name: newName,
  };
  
  try {
    const key = SAVE_SLOT_KEYS[index];
    localStorage.setItem(key, JSON.stringify(updatedSlot));
    
    // Update metadata
    const metadata = getMetadata();
    const metaIndex = metadata.findIndex(m => m.slotIndex === index);
    if (metaIndex >= 0) {
      metadata[metaIndex].name = newName;
      saveMetadata(metadata);
    }
  } catch (error) {
    console.error(`Failed to rename slot ${index}:`, error);
    throw error;
  }
}

/**
 * Get all save slots
 * @returns Array of SaveSlot or null for empty slots
 */
export function getAllSlots(): (SaveSlot | null)[] {
  return SAVE_SLOT_KEYS.map((_, index) => loadSlot(index));
}

/**
 * Check if any save exists
 * @returns True if at least one save exists
 */
export function hasAnySave(): boolean {
  return getAllSlots().some(slot => slot !== null);
}

/**
 * Get the latest auto-save
 * @returns The auto-save slot or null
 */
export function getLatestAutoSave(): SaveSlot | null {
  return loadSlot(0);
}

/**
 * Get saves sorted by timestamp (newest first)
 * @returns Array of non-null save slots sorted by timestamp
 */
export function getSavesSortedByTime(): SaveSlot[] {
  return getAllSlots()
    .filter((slot): slot is SaveSlot => slot !== null)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Clear all save slots
 */
export function clearAllSaves(): void {
  if (!isLocalStorageAvailable()) return;
  
  SAVE_SLOT_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem(METADATA_KEY);
}

/**
 * Export a save slot as JSON string
 * @param index - Slot index
 * @returns JSON string of the save slot or null
 */
export function exportSlot(index: number): string | null {
  const slot = loadSlot(index);
  return slot ? JSON.stringify(slot, null, 2) : null;
}

/**
 * Import a save from JSON string
 * @param index - Target slot index
 * @param jsonData - JSON string of the save
 * @returns The imported SaveSlot
 */
export function importSlot(index: number, jsonData: string): SaveSlot {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }
  
  try {
    const slot = JSON.parse(jsonData) as SaveSlot;
    
    // Validate required fields
    if (!slot.id || !slot.timestamp || slot.chapter === undefined) {
      throw new Error('Invalid save data format');
    }
    
    // Save to slot
    const key = SAVE_SLOT_KEYS[index];
    localStorage.setItem(key, JSON.stringify(slot));
    
    // Update metadata
    const metadata = getMetadata();
    const existingIndex = metadata.findIndex(m => m.slotIndex === index);
    
    const newMetadata: SaveSlotMetadata & { slotIndex: number } = {
      id: slot.id,
      name: slot.name,
      timestamp: slot.timestamp,
      chapter: slot.chapter,
      preview: slot.preview,
      thumbnail: slot.thumbnail,
      playTime: slot.playTime,
      isAutoSave: index === 0,
      slotIndex: index,
    };
    
    if (existingIndex >= 0) {
      metadata[existingIndex] = newMetadata;
    } else {
      metadata.push(newMetadata);
    }
    
    saveMetadata(metadata);
    
    return slot;
  } catch (error) {
    console.error('Failed to import save:', error);
    throw error;
  }
}
