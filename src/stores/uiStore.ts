import { create } from 'zustand';
import type { ModalType } from '@/types';

interface UIState {
  // Modal state
  currentModal: ModalType;
  modalData: Record<string, unknown>;

  // Typing indicator
  isTyping: boolean;
  typingProgress: number;

  // Auto-play
  autoPlayActive: boolean;

  // Loading states
  isLoading: boolean;
  loadingMessage: string;

  // Actions
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  setTyping: (isTyping: boolean) => void;
  setTypingProgress: (progress: number) => void;
  toggleAutoPlay: () => void;
  setAutoPlay: (active: boolean) => void;
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentModal: 'none',
  modalData: {},
  isTyping: false,
  typingProgress: 0,
  autoPlayActive: false,
  isLoading: false,
  loadingMessage: '',

  openModal: (modal, data = {}) => set({ currentModal: modal, modalData: data }),
  closeModal: () => set({ currentModal: 'none', modalData: {} }),

  setTyping: (isTyping) => set({ isTyping, typingProgress: isTyping ? get().typingProgress : 0 }),
  setTypingProgress: (progress) => set({ typingProgress: Math.max(0, Math.min(100, progress)) }),

  toggleAutoPlay: () => set((prev) => ({ autoPlayActive: !prev.autoPlayActive })),
  setAutoPlay: (active) => set({ autoPlayActive: active }),

  setLoading: (isLoading, message = '') => set({ isLoading, loadingMessage: message }),
}));

// Selectors
export const selectCurrentModal = (state: UIState) => state.currentModal;
export const selectIsTyping = (state: UIState) => state.isTyping;
export const selectAutoPlayActive = (state: UIState) => state.autoPlayActive;
export const selectIsLoading = (state: UIState) => state.isLoading;
