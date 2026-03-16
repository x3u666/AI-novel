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
  
  // Sidebar
  sidebarOpen: boolean;
  
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
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Default state
  currentModal: 'none',
  modalData: {},
  isTyping: false,
  typingProgress: 0,
  autoPlayActive: false,
  sidebarOpen: false,
  isLoading: false,
  loadingMessage: '',
  
  // Modal actions
  openModal: (modal, data = {}) => {
    set({ currentModal: modal, modalData: data });
  },
  
  closeModal: () => {
    set({ currentModal: 'none', modalData: {} });
  },
  
  // Typing actions
  setTyping: (isTyping) => {
    set({ isTyping, typingProgress: isTyping ? get().typingProgress : 0 });
  },
  
  setTypingProgress: (progress) => {
    set({ typingProgress: Math.max(0, Math.min(100, progress)) });
  },
  
  // Auto-play actions
  toggleAutoPlay: () => {
    set((prev) => ({ autoPlayActive: !prev.autoPlayActive }));
  },
  
  setAutoPlay: (active) => {
    set({ autoPlayActive: active });
  },
  
  // Sidebar actions
  toggleSidebar: () => {
    set((prev) => ({ sidebarOpen: !prev.sidebarOpen }));
  },
  
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
  
  // Loading actions
  setLoading: (isLoading, message = '') => {
    set({ isLoading, loadingMessage: message });
  },
}));

// Selectors
export const selectCurrentModal = (state: UIState) => state.currentModal;
export const selectIsTyping = (state: UIState) => state.isTyping;
export const selectAutoPlayActive = (state: UIState) => state.autoPlayActive;
export const selectSidebarOpen = (state: UIState) => state.sidebarOpen;
export const selectIsLoading = (state: UIState) => state.isLoading;
