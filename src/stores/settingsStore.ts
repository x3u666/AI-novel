import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsConfig, TextSize, Theme, Language, GameFont } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

interface SettingsState extends SettingsConfig {
  setTextSize:     (size: TextSize)     => void;
  setTypingSpeed:  (speed: number)      => void;
  setAutoPlaySpeed:(speed: number)      => void;
  setMusicVolume:  (volume: number)     => void;
  setSfxVolume:    (volume: number)     => void;
  setTheme:        (theme: Theme)       => void;
  setLanguage:     (language: Language) => void;
  setGameFont:     (font: GameFont)     => void;
  resetSettings:   ()                   => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTextSize:     (size)    => set({ textSize: size }),
      setTypingSpeed:  (speed)   => set({ typingSpeed: Math.max(20, Math.min(100, speed)) }),
      setAutoPlaySpeed:(speed)   => set({ autoPlaySpeed: Math.max(1000, Math.min(5000, speed)) }),
      setMusicVolume:  (volume)  => set({ musicVolume: Math.max(0, Math.min(100, volume)) }),
      setSfxVolume:    (volume)  => set({ sfxVolume: Math.max(0, Math.min(100, volume)) }),
      setTheme:        (theme)   => set({ theme }),
      setLanguage:     (language)=> set({ language }),
      setGameFont:     (font)    => set({ gameFont: font }),
      resetSettings:   ()        => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'visual-novel-settings',
      onRehydrateStorage: () => (state) => {
        // Migrate old font values to new ones
        const validFonts = ['inter', 'source_serif', 'spectral'];
        if (state && !validFonts.includes(state.gameFont)) {
          state.gameFont = 'inter';
        }
        // Migrate old default textSize
        if (state && !state.textSize) {
          state.textSize = 'large';
        }
      },
      partialize: (state) => ({
        textSize:      state.textSize,
        typingSpeed:   state.typingSpeed,
        autoPlaySpeed: state.autoPlaySpeed,
        musicVolume:   state.musicVolume,
        sfxVolume:     state.sfxVolume,
        theme:         state.theme,
        language:      state.language,
        gameFont:      state.gameFont,
      }),
    }
  )
);

export const selectTextSize     = (s: SettingsState) => s.textSize;
export const selectTypingSpeed  = (s: SettingsState) => s.typingSpeed;
export const selectGameFont     = (s: SettingsState) => s.gameFont;
