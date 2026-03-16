import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsConfig, TextSize, Theme, Language } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

interface SettingsState extends SettingsConfig {
  // Actions
  setTextSize: (size: TextSize) => void;
  setTypingSpeed: (speed: number) => void;
  setAutoPlaySpeed: (speed: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      ...DEFAULT_SETTINGS,
      
      // Actions
      setTextSize: (size) => set({ textSize: size }),
      setTypingSpeed: (speed) => set({ typingSpeed: Math.max(20, Math.min(100, speed)) }),
      setAutoPlaySpeed: (speed) => set({ autoPlaySpeed: Math.max(1000, Math.min(5000, speed)) }),
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(100, volume)) }),
      setSfxVolume: (volume) => set({ sfxVolume: Math.max(0, Math.min(100, volume)) }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'visual-novel-settings',
      partialize: (state) => ({
        textSize: state.textSize,
        typingSpeed: state.typingSpeed,
        autoPlaySpeed: state.autoPlaySpeed,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

// Selectors
export const selectTextSize = (state: SettingsState) => state.textSize;
export const selectTypingSpeed = (state: SettingsState) => state.typingSpeed;
export const selectAutoPlaySpeed = (state: SettingsState) => state.autoPlaySpeed;
export const selectMusicVolume = (state: SettingsState) => state.musicVolume;
export const selectSfxVolume = (state: SettingsState) => state.sfxVolume;
export const selectTheme = (state: SettingsState) => state.theme;
export const selectLanguage = (state: SettingsState) => state.language;
