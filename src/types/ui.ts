export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
export type Theme = 'dark' | 'light';
export type Language = 'ru' | 'en';
export type GameFont = 'inter' | 'source_serif' | 'spectral';

export interface SettingsConfig {
  textSize: TextSize;
  typingSpeed: number;
  autoPlaySpeed: number;
  musicVolume: number;
  sfxVolume: number;
  theme: Theme;
  language: Language;
  gameFont: GameFont;
}

export const DEFAULT_SETTINGS: SettingsConfig = {
  textSize: 'large',
  typingSpeed: 50,
  autoPlaySpeed: 3000,
  musicVolume: 5,
  sfxVolume: 70,
  theme: 'dark',
  language: 'ru',
  gameFont: 'inter',
};

export type ModalType =
  | 'none' | 'settings' | 'save' | 'load' | 'character'
  | 'inventory' | 'map' | 'narrator-select' | 'confirm' | 'help' | 'credits';

export type TextSizeClass = {
  textSize: TextSize;
  proseClass: string;
  dialogueClass: string;
  choiceClass: string;
};

export const TEXT_SIZE_CONFIG: Record<TextSize, TextSizeClass> = {
  small:  { textSize: 'small',  proseClass: 'text-sm leading-relaxed',   dialogueClass: 'text-sm',   choiceClass: 'text-sm'   },
  medium: { textSize: 'medium', proseClass: 'text-base leading-relaxed', dialogueClass: 'text-base', choiceClass: 'text-base' },
  large:  { textSize: 'large',  proseClass: 'text-lg leading-relaxed',   dialogueClass: 'text-lg',   choiceClass: 'text-lg'   },
  xlarge: { textSize: 'xlarge', proseClass: 'text-xl leading-relaxed',   dialogueClass: 'text-xl',   choiceClass: 'text-xl'   },
};

export const GAME_FONT_FAMILIES: Record<GameFont, string> = {
  inter:       '"Inter", sans-serif',
  source_serif: '"Source Serif 4", "Georgia", serif',
  spectral:    '"Spectral", "Georgia", serif',
};

export const GAME_FONT_LABELS: Record<GameFont, string> = {
  inter:       'Inter',
  source_serif: 'Source Serif 4',
  spectral:    'Spectral',
};

// Font weights per typeface
export const GAME_FONT_WEIGHTS: Record<GameFont, number> = {
  inter:       250,
  source_serif: 350,
  spectral:    300,
};

// Line heights per typeface
export const GAME_FONT_LINE_HEIGHTS: Record<GameFont, number> = {
  inter:       1.5,
  source_serif: 1.5,
  spectral:    1.75,
};

export const GAME_FONT_LABELS_SHORT: Record<GameFont, string> = {
  inter:       'Inter',
  source_serif: 'Source Serif',
  spectral:    'Spectral',
};
