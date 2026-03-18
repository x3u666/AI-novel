import type { SaveSlot, GameState } from '@/types';
import { generateShortId } from '@/utils/generateId';

/**
 * Slot layout:
 *   index 0  — auto-save (last active game, never shown in UI as a named slot)
 *   index 1-3 — user-chosen slots (shown in UI)
 */
export const SAVE_SLOT_KEYS = [
  'save_slot_0',
  'save_slot_1',
  'save_slot_2',
  'save_slot_3',
] as const;

export const USER_SLOT_INDICES = [1, 2, 3] as const;
export const AUTO_SAVE_INDEX = 0;

// ─── localStorage helpers ───────────────────────────────────────────────────

export function isLocalStorageAvailable(): boolean {
  try {
    const k = '__test__';
    window.localStorage.setItem(k, k);
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

// ─── Low-level read/write ────────────────────────────────────────────────────

export function loadSlot(index: number): SaveSlot | null {
  if (!isLocalStorageAvailable()) return null;
  if (index < 0 || index >= SAVE_SLOT_KEYS.length) return null;
  try {
    const raw = localStorage.getItem(SAVE_SLOT_KEYS[index]);
    if (!raw) return null;
    return JSON.parse(raw) as SaveSlot;
  } catch {
    return null;
  }
}

function writeSlot(index: number, slot: SaveSlot): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(SAVE_SLOT_KEYS[index], JSON.stringify(slot));
}

// ─── Build a SaveSlot from current GameState ─────────────────────────────────

function buildSlot(gameState: GameState, index: number): SaveSlot {
  const now = Date.now();
  const isAuto = index === AUTO_SAVE_INDEX;

  const sessionTime = gameState.sessionStartTime
    ? now - gameState.sessionStartTime
    : 0;
  const totalPlayTime = gameState.totalPlayTime + sessionTime;

  const preview =
    gameState.currentNarrative?.slice(0, 100) ||
    (gameState.narrativeBlocks.at(-1)?.content.slice(0, 100)) ||
    'Начало приключения';

  return {
    id: generateShortId(),
    name: isAuto ? 'Автосохранение' : `Слот ${index}`,
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
      isFinished: gameState.isFinished,
      endingId: gameState.endingId,
      selectedSlotIndex: gameState.selectedSlotIndex,
    },
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Auto-save to slot 0 only. */
export function saveAutoSlot(gameState: GameState): void {
  writeSlot(AUTO_SAVE_INDEX, buildSlot(gameState, AUTO_SAVE_INDEX));
}

/** Save to a user slot (1-3) only. */
export function saveToSelectedSlot(slotIndex: number, gameState: GameState): void {
  if (slotIndex < 1 || slotIndex > 3) return;
  writeSlot(slotIndex, buildSlot(gameState, slotIndex));
}

/**
 * Save to both slot 0 (auto) and the user slot (1-3).
 * This is the main save function used during gameplay.
 */
export function saveGame(slotIndex: number | null, gameState: GameState): void {
  saveAutoSlot(gameState);
  if (slotIndex !== null && slotIndex >= 1 && slotIndex <= 3) {
    saveToSelectedSlot(slotIndex, gameState);
  }
}

/** Legacy saveSlot — keeps compatibility with existing call-sites. */
export function saveSlot(index: number, gameState: GameState): void {
  if (!isLocalStorageAvailable()) return;
  writeSlot(index, buildSlot(gameState, index));
}

/** Load the auto-save (slot 0) — used for "Continue" button. */
export function loadAutoSave(): SaveSlot | null {
  return loadSlot(AUTO_SAVE_INDEX);
}

/** True when an auto-save exists (slot 0 is not empty). */
export function hasAutoSave(): boolean {
  return loadAutoSave() !== null;
}

/** Returns slots 1-3 (user slots shown in UI). */
export function getUserSlots(): (SaveSlot | null)[] {
  return USER_SLOT_INDICES.map((i) => loadSlot(i));
}

/** Returns all 4 slots (0-3). */
export function getAllSlots(): (SaveSlot | null)[] {
  return SAVE_SLOT_KEYS.map((_, i) => loadSlot(i));
}

export function deleteSlot(index: number): void {
  if (!isLocalStorageAvailable()) return;
  if (index < 0 || index >= SAVE_SLOT_KEYS.length) return;
  localStorage.removeItem(SAVE_SLOT_KEYS[index]);
}

export function hasAnySave(): boolean {
  return getAllSlots().some((s) => s !== null);
}

export function clearAllSaves(): void {
  if (!isLocalStorageAvailable()) return;
  SAVE_SLOT_KEYS.forEach((k) => localStorage.removeItem(k));
}

export function getLatestAutoSave(): SaveSlot | null {
  return loadAutoSave();
}

export function getSavesSortedByTime(): SaveSlot[] {
  return getAllSlots()
    .filter((s): s is SaveSlot => s !== null)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export type { SaveSlot };
