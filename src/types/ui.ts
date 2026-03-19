export type TextSize = 'small' | 'medium' | 'large' | 'xlarge';
export type Theme = 'dark' | 'light';
export type Language = 'ru' | 'en';
export type GameFont = 'inter' | 'bookerly' | 'literata' | 'garamond' | 'georgia';

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
  textSize: 'medium',
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

// Font families for game panels only (narrative + chat)
export const GAME_FONT_FAMILIES: Record<GameFont, string> = {
  inter:    '"Inter", sans-serif',
  bookerly: '"Bookerly", "Georgia", serif',
  literata: '"Literata", "Georgia", serif',
  garamond: '"Garamond", "EB Garamond", serif',
  georgia:  '"Georgia", serif',
};

export const GAME_FONT_LABELS: Record<GameFont, string> = {
  inter:    'Inter',
  bookerly: 'Bookerly',
  literata: 'Literata',
  garamond: 'Garamond',
  georgia:  'Georgia',
};
