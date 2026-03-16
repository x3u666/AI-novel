// Save service exports
export {
  SAVE_SLOT_KEYS,
  isLocalStorageAvailable,
  loadSlot,
  saveSlot,
  deleteSlot,
  renameSlot,
  getAllSlots,
  hasAnySave,
  getLatestAutoSave,
  getSavesSortedByTime,
  clearAllSaves,
  exportSlot,
  importSlot,
} from './saveService';

// Narrative service exports
export {
  generateNarrative,
  getInitialNarrative,
  processChoice,
  processUserInput,
  isEndingScene,
  getEndingInfo,
  getScenePreview,
  isValidTransition,
  getSceneChoices,
} from './narrativeService';

// Types
export type { NarrativeRequest, NarrativeResponse } from './narrativeService';
